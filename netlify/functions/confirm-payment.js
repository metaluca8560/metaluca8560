// Netlify Function — 토스페이먼츠 결제 승인
// 꿈분석기 프리미엄(dream-analyzer-pro.html)의 결제를 서버에서 최종 승인·검증합니다.
// 기본값은 토스 공식 문서의 테스트 시크릿 키(실제 과금 없음).
// 실결제 전환 시 Netlify 환경변수 TOSS_SECRET_KEY에 라이브 시크릿 키(live_gsk_...)를 설정하세요.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const EXPECTED_AMOUNT = 8900 // 프리미엄 리포트 가격(원). dream-analyzer-pro.html의 PRICE와 반드시 일치.

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let paymentKey, orderId, amount
  try { ({ paymentKey, orderId, amount } = JSON.parse(event.body)) } catch (e) { /* 아래에서 처리 */ }
  if (!paymentKey || !orderId || !amount) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'paymentKey, orderId, amount가 필요합니다' }) }
  }
  // 금액 위변조 방지: 클라이언트가 보낸 금액이 정가와 다르면 승인 거절
  if (Number(amount) !== EXPECTED_AMOUNT) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: '결제 금액이 올바르지 않습니다' }) }
  }

  const secretKey = process.env.TOSS_SECRET_KEY || 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'
  const auth = Buffer.from(secretKey + ':').toString('base64')

  try {
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount: EXPECTED_AMOUNT }),
    })
    const data = await response.json()
    if (!response.ok) {
      return { statusCode: response.status, headers: CORS, body: JSON.stringify({ error: data.message || '결제 승인에 실패했습니다', code: data.code }) }
    }
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, orderId: data.orderId, method: data.method, approvedAt: data.approvedAt }),
    }
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) }
  }
}
