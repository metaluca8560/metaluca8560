// Claude API 프록시 (Vercel Serverless Function)
//
// 보안 설정:
// - 허용 출처: 환경변수 ALLOWED_ORIGINS (쉼표 구분, 예: "https://mysite.com,http://localhost:8000")
//   미설정 시 배포된 자기 도메인만 허용됩니다. 로컬 테스트 시 localhost를 추가하세요.
// - IP당 분당 10회 요청 제한 (서버리스 인스턴스 단위의 1차 방어선 — 완벽하진 않지만
//   무제한 호출은 차단됩니다. 더 강하게 막으려면 Vercel Firewall 규칙을 추가하세요.)

const RATE_LIMIT = { windowMs: 60_000, max: 10 }
const hits = new Map()

function resolveOrigin(req) {
  const origin = req.headers.origin || ''
  // 앱인토스 미니앱은 <appName>.(private-)apps.tossmini.com 도메인에서 실행돼요 — 전부 허용
  if (/^https:\/\/[a-z0-9-]+\.(private-apps|apps)\.tossmini\.com$/.test(origin)) return origin
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean)
  if (allowed.length === 0 && req.headers.host) allowed.push(`https://${req.headers.host}`)
  return allowed.includes(origin) ? origin : null
}

function isRateLimited(ip) {
  const now = Date.now()
  const rec = hits.get(ip) || { count: 0, start: now }
  if (now - rec.start > RATE_LIMIT.windowMs) { rec.count = 0; rec.start = now }
  rec.count++
  hits.set(ip, rec)
  if (hits.size > 1000) {
    for (const [k, v] of hits) if (now - v.start > RATE_LIMIT.windowMs) hits.delete(k)
  }
  return rec.count > RATE_LIMIT.max
}

export default async function handler(req, res) {
  // Origin 헤더가 있는 요청(브라우저 CORS 컨텍스트)만 허용 목록을 검사해요.
  // 앱인토스 웹뷰 등 네이티브 컨텍스트는 Origin이 없을 수 있어 통과시키되,
  // 레이트리밋이 남용을 막는 1차 방어선이 됩니다.
  const hasOrigin = Boolean(req.headers.origin)
  const origin = resolveOrigin(req)
  if (hasOrigin && !origin) return res.status(403).json({ error: '허용되지 않은 출처입니다.' })
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })

  const { prompt, image, premium, temperature } = req.body || {}
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt required' })
  if (prompt.length > 8000) return res.status(400).json({ error: '입력이 너무 깁니다. (최대 8,000자)' })
  if (image && (typeof image.data !== 'string' || image.data.length > 3_000_000)) {
    return res.status(400).json({ error: '이미지가 너무 큽니다. (최대 약 2MB)' })
  }

  const content = image && image.data
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.media_type || 'image/jpeg', data: image.data } },
        { type: 'text', text: prompt },
      ]
    : prompt

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다.' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: premium ? 4500 : 2500,
        // 사실 전달형 응답은 낮은 temperature가 안정적 (토큰 글리치·언어 혼용 방지)
        ...(typeof temperature === 'number' && temperature >= 0 && temperature <= 1 ? { temperature } : {}),
        messages: [{ role: 'user', content }],
      }),
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
