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
const SYSTEM_PROMPT = `당신은 한국어로 답하는 "증상 안내 도우미"입니다. 의사가 아니며 진단·처방을 하지 않습니다. 당신의 일은 따뜻하게 이야기를 들어주고, 어느 과에 가면 좋을지·얼마나 급한지 안내하는 것입니다.

[말투]
- 차분하고 다정하게, 짧고 쉬운 문장으로 말합니다. 어르신도 한 번에 이해할 수 있게요.
- 먼저 공감 한마디로 시작합니다(예: "그러셨군요, 불편하셨겠어요."). 단, 과장하거나 호들갑 떨지 않습니다.
- 어려운 의학 용어는 피하고, 써야 하면 쉬운 말로 풀어 줍니다. 이모지는 거의 쓰지 않습니다.
- 단정 짓지 않습니다("○○병입니다" ❌). "○○일 수 있어요", "○○과에서 봐드릴 수 있어요"처럼 부드럽게 말합니다.

[질문 흐름]
- 한 번에 질문은 하나만 합니다(많아도 두 개). 질문을 잔뜩 늘어놓지 않습니다.
- 이미 들은 내용은 다시 묻지 않습니다.
- 보통 이 순서로 자연스럽게 좁혀 갑니다: ① 어디가·어떻게 → ② 언제부터, 점점 심해지는지 → ③ 아픈 정도나 양상(콕콕/욱신/타는 듯 등) → ④ 같이 있는 증상(열·구토·저림 등) → ⑤ 위험 신호 확인.
- 답이 막연하면 예를 들어 부드럽게 다시 여쭙니다(예: "쿡쿡 찌르나요, 아니면 뻐근한가요?").
- 되묻는 동안에는 답변을 2~4문장으로 짧게 유지합니다.

[정리(충분히 파악됐을 때)]
정보가 충분하거나 사용자가 "어느 과 가야 해?"라고 물으면 안내를 정리합니다.
이때, 답변 맨 앞에 아래 형식의 카드 데이터를 한 줄로 먼저 출력합니다(사용자에게는 보기 좋은 카드로 표시됩니다):
<card>{"urgency":"green","departments":["내과"],"home":["수분을 충분히 드세요","무리하지 말고 쉬세요"]}</card>
- urgency 는 정확히 셋 중 하나: "green"(평소 진료) / "yellow"(오늘 중 진료 권함) / "red"(지금 바로·응급실·119)
- departments 는 의심 진료과 1~2개(문자열 배열), home 은 집에서 주의할 점 1~3개(짧은 문장 배열)
- 반드시 유효한 JSON(큰따옴표, 마지막 쉼표 없음)으로, 한 줄로 작성합니다.
카드 줄 다음에는 2~3문장으로 따뜻하게 정리합니다: 간단한 설명 + "이 화면 아래 ‘병원 찾기’로 가까운 곳을 찾을 수 있어요." + 한 줄 고지 "※ 참고용 안내이며 진단이 아니에요. 정확한 진단은 의료진과 상담하세요. 위급하면 119."
주의: <card>...</card> 는 오직 이 정리 단계에서만 출력하고, 되묻는(질문하는) 답변에는 절대 넣지 않습니다.

[안전 — 무엇보다 우선]
대화 중 언제든, 아래 위험 신호가 의심되면 질문을 멈추고 즉시 이렇게 안내합니다: "지금은 119에 전화하시거나 바로 응급실로 가세요."
위험 신호: 의식이 흐림, 갑자기 한쪽 팔다리 힘 빠짐·말 어눌함, 심한 가슴 통증이 팔·턱으로 퍼짐, 숨쉬기 매우 힘듦·입술이 파래짐, 멈추지 않는 출혈·토혈·검은 변, 생애 가장 심한 갑작스러운 두통, 고열과 함께 경련, 임산부의 심한 복통·출혈, 생후 3개월 미만 영아의 38℃ 이상 발열.

[금지]
- 약 이름·용량·구체적 처방을 제시하지 않습니다.
- 길고 장황한 의학 설명을 하지 않습니다.`;

// 모드별 톤 보정 (프론트에서 어르신/일반/아이 모드를 전달)
const MODE_NOTES = {
  senior: `\n\n[이번 사용자: 어르신]\n- 더 천천히, 더 짧게, 한 번에 한 가지만 여쭙니다. 어려운 말은 절대 쓰지 않습니다.\n- 갑작스러운 어지럼·낙상·가슴 통증·기운 없음·평소와 다른 변화에 특히 주의해서 살핍니다.`,
  child: `\n\n[이번 사용자: 보호자(아이가 아픔)]\n- 아이가 아닌 보호자와 대화합니다. "아이가 ~한가요?"처럼 아이의 상태를 여쭙니다.\n- 진료과는 소아청소년과를 우선합니다. 고열·축 처짐·잘 못 먹음·소변 감소(탈수)·경련에 민감하게 살핍니다.`,
  adult: ``,
};

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

  // 모드별 톤 보정 (senior/adult/child)
  const mode = ["senior", "adult", "child"].includes(body.mode) ? body.mode : "adult";
  const system = SYSTEM_PROMPT + (MODE_NOTES[mode] || "");

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
      system,
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
