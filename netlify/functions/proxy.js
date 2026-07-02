// Netlify Function — Claude API 프록시
// 모든 분석기(꿈·유튜브·릴스·틱톡)의 /api/proxy 요청을 처리합니다.
// netlify.toml의 리다이렉트로 /api/proxy → /.netlify/functions/proxy 연결.
// Netlify 대시보드 → Site configuration → Environment variables에 CLAUDE_API_KEY 필요.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let prompt
  try { prompt = JSON.parse(event.body).prompt } catch (e) { /* 아래에서 처리 */ }
  if (!prompt) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'prompt required' }) }
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
        max_tokens: 2500,
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
