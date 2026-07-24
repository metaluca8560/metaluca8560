// Netlify Function — Claude API 프록시
// 모든 분석기(꿈·유튜브·릴스·틱톡)의 /api/proxy 요청을 처리합니다.
// netlify.toml의 리다이렉트로 /api/proxy → /.netlify/functions/proxy 연결.
// Netlify 대시보드 → Site configuration → Environment variables에 CLAUDE_API_KEY 필요.
//
// 보안 설정 (api/proxy.js Vercel 버전과 동일 규칙):
// - 허용 출처: 환경변수 ALLOWED_ORIGINS (쉼표 구분, 예: "https://mysite.com,http://localhost:8000")
//   미설정 시 배포된 자기 도메인만 허용됩니다. 앱인토스 미니앱 도메인(*.tossmini.com)은 항상 허용.
// - IP당 분당 10회 요청 제한 (서버리스 인스턴스 단위의 1차 방어선)

const RATE_LIMIT = { windowMs: 60_000, max: 10 }
const hits = new Map()

function resolveOrigin(event) {
  const origin = (event.headers && event.headers.origin) || ''
  // 앱인토스 미니앱은 <appName>.(private-)apps.tossmini.com 도메인에서 실행돼요 — 전부 허용
  if (/^https:\/\/[a-z0-9-]+\.(private-apps|apps)\.tossmini\.com$/.test(origin)) return origin
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0 && event.headers && event.headers.host) allowed.push(`https://${event.headers.host}`)
  return allowed.includes(origin) ? origin : null
}

function clientIp(event) {
  const h = event.headers || {}
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
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

exports.handler = async (event) => {
  // Origin 헤더가 있는 요청(브라우저 CORS 컨텍스트)만 허용 목록을 검사해요.
  // 앱인토스 웹뷰 등 네이티브 컨텍스트는 Origin이 없을 수 있어 통과시키되,
  // 레이트리밋이 남용을 막는 1차 방어선이 됩니다.
  const hasOrigin = Boolean(event.headers && event.headers.origin)
  const origin = resolveOrigin(event)
  const CORS = {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  if (hasOrigin && !origin) {
    return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: '허용되지 않은 출처입니다.' }) }
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  if (isRateLimited(clientIp(event))) {
    return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }) }
  }

  let prompt, premium
  try { ({ prompt, premium } = JSON.parse(event.body)) } catch (e) { /* 아래에서 처리 */ }
  if (!prompt || typeof prompt !== 'string') {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'prompt required' }) }
  }
  if (prompt.length > 8000) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: '입력이 너무 깁니다. (최대 8,000자)' }) }
  }

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다. Netlify → Site configuration → Environment variables에서 설정 후 재배포하세요.' }),
    }
  }

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
        max_tokens: premium ? 4500 : 2500, // 프리미엄 리포트는 12개월 운세 등 추가 섹션으로 더 김
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await response.json()
    return {
      statusCode: response.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
