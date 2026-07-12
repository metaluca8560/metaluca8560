// n8n 웹훅 알림 프록시 (Vercel Serverless Function)
//
// 웹훅 주소를 클라이언트 코드에 노출하지 않기 위한 중계 함수입니다.
// Vercel 환경변수 N8N_WEBHOOK_URL 에 n8n 웹훅 주소를 설정하세요.
// (예: https://xxxx.app.n8n.cloud/webhook/youtube-analysis-notify)
// 허용 출처 규칙은 api/proxy.js 와 동일합니다 (ALLOWED_ORIGINS).

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
  const origin = resolveOrigin(req)
  if (!origin) return res.status(403).json({ error: '허용되지 않은 출처입니다.' })
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  if (isRateLimited(ip)) return res.status(429).json({ error: '요청이 너무 많습니다.' })

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return res.status(200).json({ skipped: 'N8N_WEBHOOK_URL 미설정 — 알림 생략' })

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    })
    res.status(200).json({ ok: response.ok })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
