// Netlify Function — n8n 웹훅 알림 중계
// 웹훅 주소를 클라이언트 HTML에 노출하지 않기 위한 중계 함수입니다.
// 꿈분석기의 결과 이메일 발송(kind=email)과 송금 완료 알림(kind=payment)을 처리합니다.
//
// ⚠️ 저장소가 public이라 아래 기본값 주소는 이미 공개된 상태입니다.
//    완전히 숨기려면: n8n에서 웹훅 경로를 재발급하고, 새 주소는 Netlify 환경변수
//    N8N_EMAIL_WEBHOOK_URL / N8N_PAYMENT_WEBHOOK_URL 에만 넣으세요 (코드 수정 불필요).
//
// 허용 출처·레이트리밋 규칙은 netlify/functions/proxy.js와 동일합니다.

const RATE_LIMIT = { windowMs: 60_000, max: 10 }
const hits = new Map()

function hookUrl(kind) {
  if (kind === 'email') {
    return process.env.N8N_EMAIL_WEBHOOK_URL || 'https://lucame296.app.n8n.cloud/webhook/dream-analysis-email'
  }
  if (kind === 'payment') {
    return process.env.N8N_PAYMENT_WEBHOOK_URL || 'https://lucame296.app.n8n.cloud/webhook/dream-payment-notify'
  }
  return null
}

function resolveOrigin(event) {
  const origin = (event.headers && event.headers.origin) || ''
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
    return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: '요청이 너무 많습니다.' }) }
  }

  const kind = (event.queryStringParameters && event.queryStringParameters.kind) || ''
  const webhookUrl = hookUrl(kind)
  if (!webhookUrl) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'kind는 email 또는 payment여야 합니다.' }) }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body || '{}',
    })
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: response.ok }) }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
