// Netlify Function — 증권 브로커 프록시 (Alpaca 페이퍼 트레이딩)
// auto-trader.html의 실제 자동매매(모의투자) 요청을 처리합니다.
// netlify.toml 리다이렉트: /api/broker → /.netlify/functions/broker
//
// ── 필요한 환경변수 (Netlify → Site configuration → Environment variables) ──
//   ALPACA_KEY_ID       : Alpaca API Key ID
//   ALPACA_SECRET_KEY   : Alpaca API Secret Key
//   (선택) ALPACA_MAX_NOTIONAL : 1건당 최대 주문 금액(USD). 기본 100. 안전장치.
//   (선택) ALPACA_LIVE=true      : 실계좌(실제 돈) 사용. 기본은 페이퍼(모의). 절대 실수로 켜지지 않게 명시 필요.
//   (선택) ALLOWED_ORIGINS       : 허용 출처 (쉼표 구분). 미설정 시 자기 도메인.
//
// ── 안전 원칙 ──
//   • 기본 base URL은 https://paper-api.alpaca.markets (모의투자). ALPACA_LIVE=true일 때만 실계좌.
//   • 주문은 market/limit, buy/sell만 허용. 금액은 ALPACA_MAX_NOTIONAL로 상한.
//   • 시크릿은 어떤 응답에도 포함하지 않음.

const RATE_LIMIT = { windowMs: 60_000, max: 60 }
const hits = new Map()

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
  if (hits.size > 1000) { for (const [k, v] of hits) if (now - v.start > RATE_LIMIT.windowMs) hits.delete(k) }
  return rec.count > RATE_LIMIT.max
}

const LIVE = process.env.ALPACA_LIVE === 'true'
const TRADE_BASE = LIVE ? 'https://api.alpaca.markets' : 'https://paper-api.alpaca.markets'
const MAX_NOTIONAL = Number(process.env.ALPACA_MAX_NOTIONAL || 100)

function auth() {
  return {
    'APCA-API-KEY-ID': process.env.ALPACA_KEY_ID || '',
    'APCA-API-SECRET-KEY': process.env.ALPACA_SECRET_KEY || '',
    'Content-Type': 'application/json',
  }
}

async function alpaca(method, path, body) {
  const res = await fetch(TRADE_BASE + path, {
    method,
    headers: auth(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : {} } catch (e) { data = { raw: text } }
  return { status: res.status, data }
}

exports.handler = async (event) => {
  const hasOrigin = Boolean(event.headers && event.headers.origin)
  const origin = resolveOrigin(event)
  const CORS = {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (hasOrigin && !origin) return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: '허용되지 않은 출처입니다.' }) }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  if (isRateLimited(clientIp(event))) return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: '요청이 너무 많습니다.' }) }

  if (!process.env.ALPACA_KEY_ID || !process.env.ALPACA_SECRET_KEY) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({
      error: 'ALPACA_KEY_ID / ALPACA_SECRET_KEY 환경변수가 없습니다. Netlify 환경변수에 설정 후 재배포하세요.',
      configured: false,
    }) }
  }

  let req = {}
  try { req = JSON.parse(event.body || '{}') } catch (e) {}
  const action = req.action

  try {
    if (action === 'account') {
      const { status, data } = await alpaca('GET', '/v2/account')
      // 필요한 필드만 노출
      const safe = status === 200 ? {
        equity: data.equity, last_equity: data.last_equity, cash: data.cash,
        buying_power: data.buying_power, portfolio_value: data.portfolio_value,
        currency: data.currency, status: data.status, pattern_day_trader: data.pattern_day_trader,
      } : data
      return { statusCode: status, headers: CORS, body: JSON.stringify({ mode: LIVE ? 'LIVE' : 'PAPER', account: safe }) }
    }

    if (action === 'positions') {
      const { status, data } = await alpaca('GET', '/v2/positions')
      return { statusCode: status, headers: CORS, body: JSON.stringify({ positions: data }) }
    }

    if (action === 'clock') {
      const { status, data } = await alpaca('GET', '/v2/clock')
      return { statusCode: status, headers: CORS, body: JSON.stringify({ clock: data }) }
    }

    if (action === 'orders') {
      const { status, data } = await alpaca('GET', '/v2/orders?status=all&limit=20&direction=desc')
      return { statusCode: status, headers: CORS, body: JSON.stringify({ orders: data }) }
    }

    if (action === 'order') {
      const side = String(req.side || '').toLowerCase()
      if (!['buy', 'sell'].includes(side)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'side must be buy/sell' }) }
      const symbol = String(req.symbol || '').toUpperCase()
      if (!symbol) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'symbol required' }) }
      const type = ['market', 'limit'].includes(req.type) ? req.type : 'market'

      const order = { symbol, side, type, time_in_force: req.time_in_force || (symbol.includes('/') ? 'gtc' : 'day') }
      // notional 우선, 없으면 qty. 상한 검사.
      if (req.notional != null) {
        const n = Number(req.notional)
        if (!(n > 0) || n > MAX_NOTIONAL) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `notional은 0~${MAX_NOTIONAL} 사이여야 합니다 (안전상한).` }) }
        order.notional = n
      } else if (req.qty != null) {
        const q = Number(req.qty)
        if (!(q > 0)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'qty invalid' }) }
        order.qty = q
      } else {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'notional 또는 qty가 필요합니다.' }) }
      }
      if (type === 'limit') {
        const lp = Number(req.limit_price)
        if (!(lp > 0)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'limit_price required for limit order' }) }
        order.limit_price = lp
      }

      const { status, data } = await alpaca('POST', '/v2/orders', order)
      const safe = status < 300 ? {
        id: data.id, symbol: data.symbol, side: data.side, qty: data.qty, notional: data.notional,
        type: data.type, status: data.status, filled_avg_price: data.filled_avg_price, submitted_at: data.submitted_at,
      } : data
      return { statusCode: status, headers: CORS, body: JSON.stringify({ mode: LIVE ? 'LIVE' : 'PAPER', order: safe }) }
    }

    if (action === 'close') {
      const symbol = encodeURIComponent(String(req.symbol || '').toUpperCase())
      if (!symbol) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'symbol required' }) }
      const { status, data } = await alpaca('DELETE', '/v2/positions/' + symbol)
      return { statusCode: status, headers: CORS, body: JSON.stringify({ closed: data }) }
    }

    if (action === 'closeAll') {
      const { status, data } = await alpaca('DELETE', '/v2/positions?cancel_orders=true')
      return { statusCode: status, headers: CORS, body: JSON.stringify({ closedAll: data }) }
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action', actions: ['account', 'positions', 'clock', 'orders', 'order', 'close', 'closeAll'] }) }
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'broker fetch failed: ' + err.message }) }
  }
}
