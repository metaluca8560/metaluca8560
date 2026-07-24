// Netlify Edge Function — 꿈분석기 전용 Claude API 스트리밍 프록시
// 일반 함수(netlify/functions/proxy.js)는 10초 실행 제한이 있어 긴 프리미엄 리포트가 잘립니다.
// 엣지 함수는 응답을 스트리밍으로 흘려보내므로 제한 없이 긴 리포트를 생성할 수 있어요.
// 환경변수: CLAUDE_API_KEY (기존 그대로 사용)
//
// 보안 설정 (netlify/functions/proxy.js와 동일 규칙):
// - 허용 출처: ALLOWED_ORIGINS 환경변수, 미설정 시 자기 도메인. *.tossmini.com은 항상 허용.
// - IP당 분당 10회 요청 제한 (엣지 아이솔레이트 단위의 1차 방어선)

const RATE_LIMIT = { windowMs: 60_000, max: 10 }
const hits = new Map()

function env(name) {
  return (globalThis.Netlify && Netlify.env.get(name)) ||
    (globalThis.Deno && Deno.env.get(name)) || ''
}

function resolveOrigin(request) {
  const origin = request.headers.get('origin') || ''
  // 앱인토스 미니앱은 <appName>.(private-)apps.tossmini.com 도메인에서 실행돼요 — 전부 허용
  if (/^https:\/\/[a-z0-9-]+\.(private-apps|apps)\.tossmini\.com$/.test(origin)) return origin
  const allowed = env('ALLOWED_ORIGINS').split(',').map((s) => s.trim()).filter(Boolean)
  if (allowed.length === 0) allowed.push(new URL(request.url).origin)
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

export default async (request, context) => {
  // Origin 헤더가 있는 요청(브라우저 CORS 컨텍스트)만 허용 목록을 검사해요.
  // 네이티브 웹뷰 등 Origin 없는 컨텍스트는 통과시키되 레이트리밋이 남용을 막습니다.
  const hasOrigin = Boolean(request.headers.get('origin'))
  const origin = resolveOrigin(request)
  const CORS = {
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  const jsonRes = (status, obj) =>
    new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  if (hasOrigin && !origin) return jsonRes(403, { error: '허용되지 않은 출처입니다.' })

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (request.method !== 'POST') return jsonRes(405, { error: 'Method not allowed' })

  const ip = (context && context.ip) ||
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (isRateLimited(ip)) return jsonRes(429, { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' })

  let prompt, premium
  try { ({ prompt, premium } = await request.json()) } catch (e) { /* 아래에서 처리 */ }
  if (!prompt || typeof prompt !== 'string') return jsonRes(400, { error: 'prompt required' })
  if (prompt.length > 8000) return jsonRes(400, { error: '입력이 너무 깁니다. (최대 8,000자)' })

  const apiKey = env('CLAUDE_API_KEY')
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
