// Netlify Function — 한국투자증권(KIS) Open API 프록시 (국내주식, 모의투자 기본)
// auto-trader.html의 KIS 자동매매 요청을 처리합니다.
// netlify.toml 리다이렉트: /api/kis → /.netlify/functions/kis
//
// ── 필요한 환경변수 (Netlify → Environment variables) ──
//   KIS_APP_KEY      : KIS 앱키
//   KIS_APP_SECRET   : KIS 앱시크릿
//   KIS_ACCOUNT      : 계좌번호 "종합계좌8자리-상품코드2자리" (예: 50123456-01)
//   (선택) KIS_ENV        : 'vts'(모의, 기본) | 'real'(실전, 실제 돈)
//   (선택) KIS_MAX_QTY    : 1건당 최대 주문 수량(주). 기본 10. 안전장치.
//   (선택) ALLOWED_ORIGINS
//
// 응답은 Alpaca 프록시(broker.js)와 같은 형태로 정규화합니다:
//   account → { mode, account:{ equity, cash, ... } }
//   order   → { mode, order:{ status, ... } }
//   price   → { price }

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

const REAL = process.env.KIS_ENV === 'real'
const BASE = REAL ? 'https://openapi.koreainvestment.com:9443' : 'https://openapivts.koreainvestment.com:29443'
const MAX_QTY = Number(process.env.KIS_MAX_QTY || 10)
// tr_id: 실전/모의 · 매수/매도 · 잔고
const TR = {
  buy: REAL ? 'TTTC0802U' : 'VTTC0802U',
  sell: REAL ? 'TTTC0801U' : 'VTTC0801U',
  balance: REAL ? 'TTTC8434R' : 'VTTC8434R',
  price: 'FHKST01010100',
}

function acct() {
  const raw = (process.env.KIS_ACCOUNT || '').trim()
  const [cano, pc] = raw.split('-')
  return { CANO: (cano || '').padStart(8, '0'), ACNT_PRDT_CD: pc || '01' }
}

// ── access token 캐시 (웜 인스턴스에서 재사용, KIS 토큰은 24h 유효) ──
let tokenCache = { token: null, exp: 0 }
async function getToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 60_000) return tokenCache.token
  const res = await fetch(BASE + '/oauth2/tokenP', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', appkey: process.env.KIS_APP_KEY, appsecret: process.env.KIS_APP_SECRET }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.access_token) throw new Error('토큰 발급 실패: ' + (data.error_description || data.msg1 || res.status))
  tokenCache = { token: data.access_token, exp: Date.now() + (Number(data.expires_in || 86400) * 1000) }
  return tokenCache.token
}
function headers(tr_id, token) {
  return {
    'content-type': 'application/json; charset=utf-8',
    authorization: 'Bearer ' + token,
    appkey: process.env.KIS_APP_KEY,
    appsecret: process.env.KIS_APP_SECRET,
    tr_id, custtype: 'P',
  }
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

  if (!process.env.KIS_APP_KEY || !process.env.KIS_APP_SECRET || !process.env.KIS_ACCOUNT) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({
      error: 'KIS_APP_KEY / KIS_APP_SECRET / KIS_ACCOUNT 환경변수가 필요합니다.', configured: false }) }
  }

  let req = {}
  try { req = JSON.parse(event.body || '{}') } catch (e) {}
  const action = req.action
  const mode = REAL ? 'REAL' : 'PAPER(모의)'

  try {
    const token = await getToken()
    const { CANO, ACNT_PRDT_CD } = acct()

    if (action === 'price') {
      const code = String(req.code || '').replace(/\D/g, '').padStart(6, '0')
      const url = BASE + `/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${code}`
      const res = await fetch(url, { headers: headers(TR.price, token) })
      const data = await res.json().catch(() => ({}))
      const price = Number(data.output && data.output.stck_prpr)
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ price, code, raw: res.status === 200 ? undefined : data }) }
    }

    if (action === 'account') {
      const q = new URLSearchParams({
        CANO, ACNT_PRDT_CD, AFHR_FLPR_YN: 'N', OFL_YN: '', INQR_DVSN: '02', UNPR_DVSN: '01',
        FUND_STTL_ICLD_YN: 'N', FNCG_AMT_AUTO_RDPT_YN: 'N', PRCS_DVSN: '00', CTX_AREA_FK100: '', CTX_AREA_NK100: '',
      })
      const res = await fetch(BASE + '/uapi/domestic-stock/v1/trading/inquire-balance?' + q, { headers: headers(TR.balance, token) })
      const data = await res.json().catch(() => ({}))
      const o2 = (data.output2 && data.output2[0]) || {}
      const account = {
        equity: Number(o2.tot_evlu_amt || 0),          // 총평가금액
        cash: Number(o2.dnca_tot_amt || 0),            // 예수금총액
        pnl: Number(o2.evlu_pfls_smtl_amt || 0),       // 평가손익합계
        buying_power: Number(o2.nxdy_excc_amt || 0),
        status: data.rt_cd === '0' ? 'ACTIVE' : (data.msg1 || 'ERR'),
        currency: 'KRW',
        positions: (data.output1 || []).map((p) => ({ code: p.pdno, name: p.prdt_name, qty: Number(p.hldg_qty), avg: Number(p.pchs_avg_pric), cur: Number(p.prpr) })),
      }
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ mode, account }) }
    }

    if (action === 'order') {
      const side = String(req.side || '').toLowerCase()
      if (!['buy', 'sell'].includes(side)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'side must be buy/sell' }) }
      const code = String(req.code || '').replace(/\D/g, '').padStart(6, '0')
      const qty = Math.floor(Number(req.qty))
      if (!(qty > 0)) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'qty invalid' }) }
      if (qty > MAX_QTY) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `qty는 최대 ${MAX_QTY}주까지 (안전상한).` }) }
      // ORD_DVSN 01 = 시장가, ORD_UNPR 0
      const body = { CANO, ACNT_PRDT_CD, PDNO: code, ORD_DVSN: req.ord_dvsn || '01', ORD_QTY: String(qty), ORD_UNPR: '0' }
      const res = await fetch(BASE + '/uapi/domestic-stock/v1/trading/order-cash', {
        method: 'POST', headers: headers(side === 'buy' ? TR.buy : TR.sell, token), body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      const ok = data.rt_cd === '0'
      const order = {
        status: ok ? 'accepted' : 'rejected',
        symbol: code, side, qty,
        order_no: data.output && data.output.ODNO,
        msg: data.msg1,
      }
      return { statusCode: res.status, headers: CORS, body: JSON.stringify({ mode, order }) }
    }

    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'unknown action', actions: ['account', 'price', 'order'] }) }
  } catch (err) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'KIS fetch failed: ' + err.message }) }
  }
}
