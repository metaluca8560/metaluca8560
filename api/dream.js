// Claude 스트리밍 프록시 (Vercel Serverless Function) — 꿈분석기 전용 (/api/dream)
// Anthropic 스트리밍(SSE) 응답을 그대로 통과시켜, 클라이언트가 글자 단위로 리포트를 받아요.
//
// 보안 설정은 api/proxy.js와 동일:
// - 허용 출처: ALLOWED_ORIGINS 환경변수 (미설정 시 자기 도메인). Origin 없는 네이티브 웹뷰는 통과.
// - IP당 분당 10회 레이트리밋.

export const config = { supportsResponseStreaming: true }

const RATE_LIMIT = { windowMs: 60_000, max: 10 }
const hits = new Map()

function resolveOrigin(req) {
  const origin = req.headers.origin || ''
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

  const { prompt, premium } = req.body || {}
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'prompt required' })
  if (prompt.length > 8000) return res.status(400).json({ error: '입력이 너무 깁니다. (최대 8,000자)' })

  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다.' })

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: premium ? 4500 : 3000,
        temperature: 0.7,
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!upstream.ok || !upstream.body) {
      const data = await upstream.json().catch(() => ({}))
      return res.status(upstream.status || 500).json(data.error ? data : { error: 'AI 호출에 실패했습니다.' })
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    })
    const reader = upstream.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
  } catch (err) {
    if (res.headersSent) { res.end() } else { res.status(500).json({ error: err.message }) }
  }
}
