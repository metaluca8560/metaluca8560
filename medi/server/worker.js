/* ================================================================
   오늘 어디 아파? — 백엔드 (Cloudflare Worker)
   ----------------------------------------------------------------
   엔드포인트
     POST /triage     : AI 문진 (Claude Messages API 호출)
     GET  /hospitals   : 위치기반 응급/병원 목록 (공공데이터 E-Gen 프록시)
   비밀키는 서버 환경변수로만 두고 절대 프론트에 노출하지 않습니다.
     - ANTHROPIC_API_KEY : Anthropic API 키 (Secret)
     - DATA_GO_KR_KEY    : 공공데이터포털 서비스키 (Secret, /hospitals용)
     - ALLOW_ORIGIN      : 허용할 프론트 주소 (예: https://metaluca8560.github.io). 기본 "*"
   배포 방법은 같은 폴더의 README.md 참고.
   ================================================================ */

const MODEL = "claude-opus-4-8"; // 비용을 낮추려면 "claude-sonnet-4-6" 또는 "claude-haiku-4-5"로 교체 가능

// 안전 가드레일 — 진단이 아닌 안내, 레드플래그 우선
const SYSTEM_PROMPT = `당신은 한국어로 답하는 "증상 안내 도우미"입니다. 의사가 아니며 진단·처방을 하지 않습니다.

규칙:
- 진단(❌) 대신 안내(⭕): "○○병입니다"가 아니라 "○○과 진료를 권해요 / 응급도 / 집에서 주의할 점"으로 답합니다.
- 다음 위험 신호(레드플래그) 중 하나라도 의심되면, 다른 무엇보다 먼저 "지금 즉시 119에 전화하거나 응급실로 가세요"라고 안내합니다:
  의식 저하, 갑작스런 한쪽 마비·언어장애, 심한 흉통이 팔·턱으로 퍼짐, 호흡곤란·입술 청색증, 멈추지 않는 출혈·토혈·검은 변, 생애 최악의 갑작스런 두통, 고열과 함께 경련, 임산부의 심한 복통·출혈, 영아(생후 3개월 미만)의 38℃ 이상 발열.
- 한 번에 한두 가지만 짧게 되묻습니다(부위·언제부터·정도·동반 증상).
- 충분히 파악되면: ① 의심 진료과 ② 응급도(🟢평소 진료 / 🟡오늘 중 / 🔴즉시) ③ 집에서 주의할 점 1~3가지를 간단히 정리합니다.
- 약 이름과 용량, 구체적 처방은 제시하지 않습니다.
- 답변 끝에 한 줄: "※ 의학적 진단이 아니며, 정확한 진단은 의료진과 상담하세요. 위급 시 119."
- 따뜻하고 쉬운 말로, 어르신도 이해하기 쉽게 답합니다.`;

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    try {
      if (url.pathname === "/triage" && request.method === "POST") {
        return await handleTriage(request, env, cors);
      }
      if (url.pathname === "/hospitals" && request.method === "GET") {
        return await handleHospitals(url, env, cors);
      }
      return json({ error: "not found" }, 404, cors);
    } catch (err) {
      return json({ error: String(err && err.message || err) }, 500, cors);
    }
  },
};

// ----- AI 문진 -----
async function handleTriage(request, env, cors) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY 미설정" }, 500, cors);
  const body = await request.json().catch(() => ({}));
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  // 사용자/assistant 역할만 통과, 길이 제한(최근 20개)
  const messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20);
  if (!messages.length || messages[0].role !== "user") {
    return json({ error: "messages가 user로 시작해야 합니다" }, 400, cors);
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return json({ error: "anthropic " + res.status, detail }, 502, cors);
  }
  const data = await res.json();
  // 안전 신호 처리: 거부(refusal) 시 안내 메시지로 대체
  if (data.stop_reason === "refusal") {
    return json({ reply: "이 내용은 도와드리기 어려워요. 증상이 걱정되면 가까운 병원에 문의하시고, 위급하면 119에 연락하세요." }, 200, cors);
  }
  const reply = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return json({ reply }, 200, cors);
}

// ----- 위치기반 병원/응급 목록 (공공데이터 E-Gen) -----
async function handleHospitals(url, env, cors) {
  if (!env.DATA_GO_KR_KEY) return json({ error: "DATA_GO_KR_KEY 미설정", items: [] }, 200, cors);
  const lat = url.searchParams.get("lat");
  const lng = url.searchParams.get("lng");
  if (!lat || !lng) return json({ error: "lat/lng 필요", items: [] }, 400, cors);

  // 응급의료기관 위치정보 조회 (반경 내, 거리순). 필요 시 다른 오퍼레이션으로 교체하세요.
  //   서비스: ErmctInfoInqireService (응급의료정보) — 공공데이터포털에서 활용신청 후 키 발급
  const api = new URL("https://apis.data.go.kr/B552657/ErmctInfoInqireService/getEgytLcinfoInqire");
  api.searchParams.set("serviceKey", env.DATA_GO_KR_KEY); // 디코딩된 키 권장
  api.searchParams.set("WGS84_LON", lng);
  api.searchParams.set("WGS84_LAT", lat);
  api.searchParams.set("pageNo", "1");
  api.searchParams.set("numOfRows", "10");

  const res = await fetch(api.toString());
  if (!res.ok) return json({ error: "data.go.kr " + res.status, items: [] }, 502, cors);
  const xml = await res.text();
  const items = parseEgenItems(xml);
  return json({ items }, 200, cors);
}

// 공공데이터 XML을 간단 파싱 (Workers에는 DOMParser가 없어 정규식 사용)
function parseEgenItems(xml) {
  const out = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const b of blocks) {
    const get = (tag) => {
      const m = b.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
    };
    const dist = get("distance");
    out.push({
      name: get("dutyName"),
      tel: get("dutyTel1"),
      address: get("dutyAddr"),
      distance: dist ? `${Number(dist).toFixed(1)}km` : "",
    });
  }
  return out;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors },
  });
}
