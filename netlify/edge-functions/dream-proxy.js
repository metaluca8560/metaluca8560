// Netlify Edge Function — 꿈분석기 전용 Claude API 스트리밍 프록시
// 일반 함수(netlify/functions/proxy.js)는 10초 실행 제한이 있어 긴 프리미엄 리포트가 잘립니다.
// 엣지 함수는 응답을 스트리밍으로 흘려보내므로 제한 없이 긴 리포트를 생성할 수 있어요.
// 환경변수: CLAUDE_API_KEY (기존 그대로 사용)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonRes(status, obj) {
  return new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

export default async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (request.method !== 'POST') return jsonRes(405, { error: 'Method not allowed' })

  let prompt, premium
  try { ({ prompt, premium } = await request.json()) } catch (e) { /* 아래에서 처리 */ }
  if (!prompt) return jsonRes(400, { error: 'prompt required' })

  const apiKey = (globalThis.Netlify && Netlify.env.get('CLAUDE_API_KEY')) ||
    (globalThis.Deno && Deno.env.get('CLAUDE_API_KEY'))
  if (!apiKey) return jsonRes(500, { error: 'CLAUDE_API_KEY 환경변수가 설정되지 않았습니다.' })

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: premium ? 4500 : 2500,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return new Response(errText, { status: upstream.status, headers: { ...CORS, 'Content-Type': 'application/json' } })
  }

  // Anthropic SSE 스트림을 그대로 통과 — 클라이언트가 content_block_delta를 조립
  return new Response(upstream.body, {
    headers: { ...CORS, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}

export const config = { path: '/api/dream' }
