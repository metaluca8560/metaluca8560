// Netlify Function — 빗썸(Bithumb) 주문 프록시 (실매매, 원화 · API 2.0)
// auto-trader.html의 BITHUMB 엔진 요청을 처리합니다.
// netlify.toml 리다이렉트: /api/bithumb → /.netlify/functions/bithumb
//
// 빗썸 API 2.0는 업비트와 호환되는 JWT 인증을 씁니다(단, payload에 timestamp 필요).
// 업비트와 달리 API 키에 IP 화이트리스트가 필수가 아니라 서버리스(고정 IP 없음)에서 동작합니다.
//
// ── 필요한 환경변수 ──
//   BITHUMB_ACCESS_KEY : 빗썸 API 2.0 Access Key (Connect Key)
//   BITHUMB_SECRET_KEY : 빗썸 API 2.0 Secret Key
//   (선택) BITHUMB_MAX_KRW : 1건당 최대 매수 금액(원). 기본 10000. 안전상한.
//   (선택) ALLOWED_ORIGINS
//
// ⚠️ 빗썸도 모의투자가 없습니다 — 실제 원화로 체결됩니다. 소액으로 시작하세요.
//
// 응답은 broker.js(Alpaca)와 같은 형태로 정규화합니다.

const crypto = require('crypto')

const RATE_LIMIT = { windowMs: 60_000, max: 60 }
const hits = new Map()
function resolveOrigin(event) {
  const origin = (event.headers && event.headers.origin) || ''
  if (/^https:\/\/[a-z0-9-]+\.(private-apps|apps)\.tossmini\.com$/.test(origin)) return origin
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0 && event.headers && event.headers.host) allowed.push(`https://${event.headers.host}`)
  return allowed.includes(origin) ? origin : null
}
function clientIp(event) {
  const h = event.headers || {}
  return h['x-nf-client-connection-ip'] || (h['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
}
function isRateLimited(ip) {
  const t = Date.now(); const rec = hits.get(ip) || { count: 0, start: t }
  if (t - rec.start > RATE_LIMIT.windowMs) { rec.count = 0; rec.start = t }
  rec.count++; hits.set(ip, rec)
  if (hits.size > 1000) for (const [k, v] of hits) if (t - v.start > RATE_LIMIT.windowMs) hits.delete(k)
  return rec.count > RATE_LIMIT.max
}

const BASE = 'https://api.bithumb.com'
const MAX_KRW = Number(process.env.BITHUMB_MAX_KRW || 10000)
const MIN_KRW = 1000 // 빗썸 원화마켓 최소 주문금액(대략)

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function signJwt(payload) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const data = header + '.' + body
  const sig = crypto.createHmac('sha256', process.env.BITHUMB_SECRET_KEY).update(data).digest()
  return data + '.' + b64url(sig)
}
function authHeader(params) {
  // 빗썸 2.0: access_key, nonce, timestamp (+ 파라미터 있으면 query_hash)
  const payload = { access_key: process.env.BITHUMB_ACCESS_KEY, nonce: crypto.randomUUID(), timestamp: Date.now() }
  if (params && Object.keys(params).length) {
    const query = new URLSearchParams(params).toString()
    payload.query_hash = crypto.createHash('sha512').update(query, 'utf-8').digest('hex')
    payload.query_hash_alg = 'SHA512'
  }
  return 'Bearer ' + signJwt(payload)
}
async function bhGet(path, params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const res = await fetch(BASE + path + qs, { headers: { Authorization: authHeader(params) } })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}
async function bhPost(path, params) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { Authorization: authHeader(params), 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

exports.handler = async (event) => {
  const hasOrigin = Boolean(event.headers && event.headers.origin)
  const origin = resolveOrigin(event)
  const CORS = {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Vary': 'Origin', 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json',
  }
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (hasOrigin && !origin) return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: '허용되지 않은 출처입니다.' }) }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (isRateLimited(clientIp(event))) return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: '요청이 너무 많습니다.' }) }

  if (!process.env.BITHUMB_ACCESS_KEY || !process.env.BITHUMB_SECRET_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({
      error: 'BITHUMB_ACCESS_KEY / BITHUMB_SECRET_KEY 환경변수가 필요합니다.', configured: false }) }
  }

  let req = {}
  try { req = JSON.parse(event.body || '{}') } catch (e) {}
  const action = req.action
  const mode = 'LIVE(빗썸·실매매·원화)'

  try {
    if (action === 'price') {
      const market = String(req.market || 'KRW-BTC').toUpperCase()
      const res = await fetch(BASE + '/v1/ticker?markets=' + encodeURIComponent(market))
      const data = await res.json().catch(() => ([]))
      const price = Array.isArray(data) && data[0] ? Number(data[0].trade_price) : NaN
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ price, market }) }
    }

    if (action === 'account') {
      const { status, data } = await bhGet('/v1/accounts')
      if (!Array.isArray(data)) {
        return { statusCode: status, headers: CORS, body: JSON.stringify({ error: (data.error && (data.error.message || data.error.name)) || '조회 실패', raw: data }) }
      }
      let cash = 0, equity = 0
      const holdings = []
      for (const a of data) {
        const bal = Number(a.balance) + Number(a.locked || 0)
        if (a.currency === 'KRW') { cash += bal; equity += bal }
        else { equity += bal * Number(a.avg_buy_price || 0); holdings.push({ currency: a.currency, balance: Number(a.balance), avg: Number(a.avg_buy_price || 0) }) }
      }
      return { statusCode: status, headers: CORS, body: JSON.stringify({ mode, account: { equity: Math.round(equity), cash: Math.round(cash), currency: 'KRW', status: 'ACTIVE', holdings } }) }
    }

    if (action === 'order') {
      const side = String(req.side || '').toLowerCase()
      const market = String(req.market || '').toUpperCase()
      if (!/^KRW-[A-Z0-9]+$/.test(market)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'market은 KRW-XXX 형식이어야 합니다.' }) }

      if (side === 'buy') {
        const amount = Math.floor(Number(req.amount))
        if (!(amount >= MIN_KRW)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `최소 주문금액은 ${MIN_KRW}원입니다.` }) }
        if (amount > MAX_KRW) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `1건 최대 ${MAX_KRW}원까지 (안전상한 BITHUMB_MAX_KRW).` }) }
        const params = { market, side: 'bid', ord_type: 'price', price: String(amount) }
        const { status, data } = await bhPost('/v1/orders', params)
        const ok = !!data.uuid
        return { statusCode: status, headers: CORS, body: JSON.stringify({ mode, order: { status: ok ? 'accepted' : 'rejected', uuid: data.uuid, market, side: 'buy', krw: amount, msg: data.error && (data.error.message || data.error.name) } }) }
      }

      if (side === 'sell') {
        const coin = market.split('-')[1]
        const { data: accts } = await bhGet('/v1/accounts')
        const held = Array.isArray(accts) ? accts.find((a) => a.currency === coin) : null
        const vol = held ? Number(held.balance) : 0
        if (!(vol > 0)) return { statusCode: 200, headers: CORS, body: JSON.stringify({ mode, order: { status: 'skipped', msg: '보유 수량 없음' } }) }
        const params = { market, side: 'ask', ord_type: 'market', volume: String(vol) }
        const { status, data } = await bhPost('/v1/orders', params)
        const ok = !!data.uuid
        return { statusCode: status, headers: CORS, body: JSON.stringify({ mode, order: { status: ok ? 'accepted' : 'rejected', uuid: data.uuid, market, side: 'sell', volume: vol, msg: data.error && (data.error.message || data.error.name) } }) }
      }

      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'side must be buy/sell' }) }
    }

    if (action === 'close') {
      return exports.handler({ ...event, body: JSON.stringify({ action: 'order', side: 'sell', market: req.market }) })
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action', actions: ['account', 'price', 'order', 'close'] }) }
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Bithumb fetch failed: ' + err.message }) }
  }
}
