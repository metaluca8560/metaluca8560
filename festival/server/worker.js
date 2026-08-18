/* ================================================================
   우리동네 무슨 축제? — 백엔드 (Cloudflare Worker)
   ----------------------------------------------------------------
   엔드포인트
     GET  /festivals  : 지역·기간별 축제 목록 조회 (공공데이터 TourAPI 프록시)
     POST /chat       : AI 대화 추천 — 실제 축제 목록을 근거로 AI가 골라줌
   비밀키는 서버 환경변수(Secret)로만 두고 절대 프론트에 노출하지 않습니다.
     - GEMINI_API_KEY    : Google AI Studio 무료 키 (있으면 Gemini 사용)
     - ANTHROPIC_API_KEY : Anthropic 키 (Gemini 키가 없을 때 사용)
     - DATA_GO_KR_KEY    : 공공데이터포털 서비스키 (TourAPI 활용신청 필요)
     - ALLOW_ORIGIN      : 허용할 프론트 주소. 기본 "*"
   ================================================================ */

const GEMINI_MODEL = "gemini-3.5-flash";
const ANTHROPIC_MODEL = "claude-opus-4-8";

// 법정동 시도코드 (lDongRegnCd) — TourAPI 지역 필터용
const REGION_CODES = {
  "서울특별시": "11", "부산광역시": "26", "대구광역시": "27", "인천광역시": "28",
  "광주광역시": "29", "대전광역시": "30", "울산광역시": "31", "세종특별자치시": "36",
  "경기도": "41", "강원특별자치도": "42", "충청북도": "43", "충청남도": "44",
  "전북특별자치도": "45", "전라남도": "46", "경상북도": "47", "경상남도": "48",
  "제주특별자치도": "50",
};

// 표준데이터에는 지역코드 파라미터가 없어서 주소 앞부분으로 지역을 가려낸다.
// 반드시 주소 "맨 앞"과 비교할 것 — 그래야 "경기도 광주시"가 광주광역시로 잘못 잡히지 않는다.
const REGION_ALIASES = {
  "서울특별시": ["서울"], "부산광역시": ["부산"], "대구광역시": ["대구"],
  "인천광역시": ["인천"], "광주광역시": ["광주"], "대전광역시": ["대전"],
  "울산광역시": ["울산"], "세종특별자치시": ["세종"], "경기도": ["경기"],
  "강원특별자치도": ["강원"], "충청북도": ["충청북도", "충북"],
  "충청남도": ["충청남도", "충남"], "전북특별자치도": ["전북", "전라북도"],
  "전라남도": ["전라남도", "전남"], "경상북도": ["경상북도", "경북"],
  "경상남도": ["경상남도", "경남"], "제주특별자치도": ["제주"],
};

const SYSTEM_PROMPT = `당신은 한국어로 답하는 다정한 "동네 축제 큐레이터"입니다. 사용자와 대화하며 관심사·분위기·시기를 파악해서, 아래 제공된 "실제 축제 목록" 중에서만 골라 추천합니다.

[말투]
- 친근하고 들뜬 말투로, 짧고 쉬운 문장으로 말합니다.
- 먼저 공감이나 관심 표현으로 시작합니다.

[질문 흐름]
- 한 번에 질문은 하나만 합니다. 이미 들은 내용은 다시 묻지 않습니다.
- 보통 이 순서로 자연스럽게 좁혀 갑니다: ① 언제쯤 놀러가고 싶은지 → ② 어떤 분위기 좋아하는지(공연/전통/음식/가족/야외 등) → ③ 혼자인지 가족·연인과인지.
- 되묻는 동안에는 답변을 2~3문장으로 짧게 유지합니다.

[추천(충분히 파악됐을 때)]
정보가 충분하거나 사용자가 "추천해줘"라고 하면 정리합니다.
이때, 답변 맨 앞에 아래 형식의 카드 데이터를 한 줄로 먼저 출력합니다(사용자에게는 보기 좋은 카드로 표시됩니다):
<card>{"picks":[{"title":"실제 축제명","when":"기간","where":"장소","why":"한 줄 추천 이유"}]}</card>
- picks 는 1~3개, 반드시 아래 "실제 축제 목록"에 있는 title을 그대로 사용합니다. 목록에 없는 축제를 지어내지 않습니다.
- 목록에 마땅한 게 없으면 picks를 빈 배열로 두고, 텍스트로 "지금은 딱 맞는 게 없어요"라고 안내합니다.
- 반드시 유효한 JSON(큰따옴표, 마지막 쉼표 없음)으로, 한 줄로 작성합니다.
카드 줄 다음에는 1~2문장으로 밝게 정리합니다.
주의: <card>...</card> 는 오직 이 추천 단계에서만 출력하고, 되묻는(질문하는) 답변에는 절대 넣지 않습니다.

[목록 읽는 법]
- 제목 옆에 [지금 진행중] 표시가 있으면 오늘 기준으로 열리고 있는 축제입니다.
- "지금/오늘/이번 주말" 같은 질문에는 [지금 진행중] 축제를 먼저 살펴봅니다.

[금지]
- "실제 축제 목록"에 없는 축제·장소·날짜를 지어내지 않습니다.
- "제가 가진 목록에는", "데이터를 못 가져왔어요" 처럼 내부 사정을 말하지 않습니다.
  없으면 그냥 "그건 지금 찾아지는 게 없네요" 정도로만 담백하게 말합니다.
- 너무 길게 설명하지 않습니다.`;

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
      if (url.pathname === "/festivals" && request.method === "GET") {
        return await handleFestivals(url, env, cors);
      }
      if (url.pathname === "/chat" && request.method === "POST") {
        return await handleChat(request, env, cors);
      }
      return json({ error: "not found" }, 404, cors);
    } catch (err) {
      return json({ error: String((err && err.message) || err) }, 500, cors);
    }
  },
};

// ----- 날짜 유틸 -----
function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ----- 축제 목록 조회 ① 한국관광공사 TourAPI -----
async function fetchTourFestivals(env, { region, from, to, numOfRows }) {
  if (!env.DATA_GO_KR_KEY) return { items: [], error: "DATA_GO_KR_KEY 미설정" };

  const today = new Date();
  // eventStartDate는 "시작일이 이 날짜 이후"를 뜻해서, 오늘로 잡으면
  // 이미 시작해 지금 진행 중인 축제가 통째로 빠진다. 과거로 넉넉히 열고
  // 아래에서 "이미 끝난 축제"를 직접 걸러낸다.
  const past = new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);
  const future = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000);
  const eventStartDate = from || ymd(past);
  const eventEndDate = to || ymd(future);

  // 서비스: 한국관광공사_국문 관광정보 서비스(KorService2) — 공공데이터포털에서 별도 활용신청 후 사용
  const api = new URL("https://apis.data.go.kr/B551011/KorService2/searchFestival2");
  api.searchParams.set("serviceKey", env.DATA_GO_KR_KEY); // 디코딩된 키 권장
  api.searchParams.set("MobileOS", "ETC");
  api.searchParams.set("MobileApp", "OurTownFestival");
  api.searchParams.set("_type", "json");
  api.searchParams.set("arrange", "A");
  api.searchParams.set("eventStartDate", eventStartDate);
  api.searchParams.set("eventEndDate", eventEndDate);
  api.searchParams.set("numOfRows", String(numOfRows || 100));
  api.searchParams.set("pageNo", "1");
  if (region && REGION_CODES[region]) api.searchParams.set("lDongRegnCd", REGION_CODES[region]);

  // data.go.kr이 간헐적으로 522/타임아웃을 내서 한 번 더 시도한다.
  let res = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    res = await fetch(api.toString()).catch(() => null);
    if (res && res.ok) break;
  }
  if (!res || !res.ok) return { items: [], error: "data.go.kr " + (res ? res.status : "unreachable") };

  const data = await res.json().catch(() => null);
  const rawItems = data?.response?.body?.items?.item;
  if (!rawItems) return { items: [] };
  const list = Array.isArray(rawItems) ? rawItems : [rawItems];

  const todayNum = ymd(today);
  const items = list
    .map((it) => ({
      title: it.title || "",
      address: [it.addr1, it.addr2].filter(Boolean).join(" "),
      tel: it.tel || "",
      rawStart: it.eventstartdate || "",
      rawEnd: it.eventenddate || "",
      startDate: fmtDate(it.eventstartdate),
      endDate: fmtDate(it.eventenddate),
      ongoing: !!(it.eventstartdate && it.eventenddate &&
        it.eventstartdate <= todayNum && it.eventenddate >= todayNum),
      image: it.firstimage || "",
      lat: it.mapy || "",
      lng: it.mapx || "",
      source: "tour",
    }))
    // 이미 끝난 축제는 제외
    .filter((f) => !f.rawEnd || f.rawEnd >= todayNum)
    // 진행 중인 축제를 먼저, 그다음 시작일 가까운 순
    .sort((a, b) => (b.ongoing - a.ongoing) || a.rawStart.localeCompare(b.rawStart));

  return { items };
}

function fmtDate(s) {
  if (!s || s.length !== 8) return s || "";
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

// "2026-10-15" / "20261015" 무엇이 와도 "20261015"로 맞춘다.
function toYmd(s) {
  const d = String(s || "").replace(/\D/g, "");
  return d.length === 8 ? d : "";
}

// ----- 축제 목록 조회 ② 행정안전부 전국문화축제표준데이터 -----
// 지자체가 직접 등록해서 관광공사 DB보다 훨씬 촘촘하다. 다만 지역 필터
// 파라미터가 없고 지난 연도 축제까지 섞여 있어서, 전부 받아온 뒤 직접 거른다.
async function fetchStandardFestivals(env, { region }) {
  if (!env.DATA_GO_KR_KEY) return { items: [] };

  const base = "https://api.data.go.kr/openapi/tn_pubr_public_cltur_fstvl_api";
  const PER_PAGE = 1000;
  const MAX_PAGES = 6; // 폭주 방지 상한

  const pageUrl = (pageNo) => {
    const u = new URL(base);
    u.searchParams.set("serviceKey", env.DATA_GO_KR_KEY);
    u.searchParams.set("type", "json");
    u.searchParams.set("numOfRows", String(PER_PAGE));
    u.searchParams.set("pageNo", String(pageNo));
    return u.toString();
  };
  // 갱신주기가 분기라서 길게 캐싱해도 안전하다. (매 대화마다 1300건을 새로 받지 않도록)
  const getPage = (pageNo) =>
    fetch(pageUrl(pageNo), { cf: { cacheTtl: 21600, cacheEverything: true } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

  const first = await getPage(1);
  if (!first) return { items: [] };

  let raw = pickStdItems(first);
  const totalCount = Number(first?.response?.body?.totalCount || 0);
  const perPage = raw.length || PER_PAGE;
  // 실제로 몇 건씩 주는지 보고 남은 페이지 수를 계산한다 (서버가 100건으로 깎아도 대응).
  if (totalCount > perPage) {
    const need = Math.min(Math.ceil(totalCount / perPage), MAX_PAGES);
    const rest = await Promise.all(
      Array.from({ length: need - 1 }, (_, i) => getPage(i + 2))
    );
    for (const page of rest) if (page) raw = raw.concat(pickStdItems(page));
  }

  const todayNum = ymd(new Date());
  const aliases = REGION_ALIASES[region] || null;

  const items = raw
    .map((it) => {
      const addr = it.rdnmadr || it.lnmadr || "";
      const rawStart = toYmd(it.fstvlStartDate);
      const rawEnd = toYmd(it.fstvlEndDate);
      return {
        title: (it.fstvlNm || "").trim(),
        address: addr,
        place: it.opar || "",
        tel: it.phoneNumber || "",
        rawStart,
        rawEnd,
        startDate: fmtDate(rawStart),
        endDate: fmtDate(rawEnd),
        ongoing: !!(rawStart && rawEnd && rawStart <= todayNum && rawEnd >= todayNum),
        image: "",
        lat: it.latitude || "",
        lng: it.longitude || "",
        source: "std",
      };
    })
    .filter((f) => f.title && f.rawStart && f.rawEnd)
    // 이미 끝난 축제 제외 (2019~2025년 데이터가 그대로 남아 있음)
    .filter((f) => f.rawEnd >= todayNum)
    // 1월 1일~12월 31일은 일정 미정 자리표시자라 축제로 보여줄 수 없다.
    .filter((f) => !(f.rawStart.slice(4) === "0101" && f.rawEnd.slice(4) === "1231"))
    .filter((f) => !aliases || aliases.some((a) => f.address.startsWith(a)));

  return { items };
}

// type=json이면 items가 배열로 오지만, XML 형태({item:[...]})로 올 때도 있어 둘 다 받는다.
function pickStdItems(data) {
  const it = data?.response?.body?.items;
  if (Array.isArray(it)) return it;
  if (Array.isArray(it?.item)) return it.item;
  if (it?.item) return [it.item];
  return [];
}

// ----- 두 출처 합치기 -----
async function fetchFestivals(env, { region, from, to, numOfRows }) {
  if (!env.DATA_GO_KR_KEY) return { items: [], error: "DATA_GO_KR_KEY 미설정" };

  const [tour, std] = await Promise.all([
    fetchTourFestivals(env, { region, from, to, numOfRows }).catch(() => ({ items: [] })),
    fetchStandardFestivals(env, { region }).catch(() => ({ items: [] })),
  ]);

  const items = dedupeFestivals([...(tour.items || []), ...(std.items || [])])
    .sort((a, b) => (b.ongoing - a.ongoing) || a.rawStart.localeCompare(b.rawStart));

  // 양쪽 다 빈손일 때만 오류로 취급한다 (한쪽만 죽어도 서비스는 계속되게).
  if (!items.length && tour.error) return { items: [], error: tour.error };
  return { items };
}

// 같은 축제가 두 출처에 다 있는 경우가 많다("울산고래축제" 등).
// 회차·연도 표기를 걷어낸 이름 + 개최 연월로 같은 축제인지 판단한다.
function normTitle(s) {
  return String(s || "")
    .replace(/\s+/g, "")
    .replace(/제?\d+회/g, "")
    .replace(/^\d{4}년?/, "")
    .replace(/[()[\]{}·・.,~\-–—'"]/g, "")
    .toLowerCase();
}

function dedupeFestivals(list) {
  const score = (x) => (x.image ? 2 : 0) + (x.address ? 1 : 0);
  const map = new Map();
  for (const f of list) {
    const key = normTitle(f.title) + "|" + f.rawStart.slice(0, 6);
    const prev = map.get(key);
    // 사진·주소가 더 충실한 쪽을 남긴다 (보통 관광공사 쪽에 사진이 있다).
    if (!prev || score(f) > score(prev)) map.set(key, f);
  }
  return [...map.values()];
}

// ----- GET /festivals -----
async function handleFestivals(url, env, cors) {
  const region = url.searchParams.get("region") || "";
  const from = url.searchParams.get("from") || "";
  const to = url.searchParams.get("to") || "";
  const { items, error } = await fetchFestivals(env, { region, from, to, numOfRows: 100 });
  if (error) return json({ error, items: [] }, 200, cors);
  return json({ items }, 200, cors);
}

// ----- POST /chat -----
async function handleChat(request, env, cors) {
  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) {
    return json({ error: "AI 키 미설정 (GEMINI_API_KEY 또는 ANTHROPIC_API_KEY)" }, 500, cors);
  }
  const body = await request.json().catch(() => ({}));
  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const region = typeof body.region === "string" ? body.region : "";

  const messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20);
  if (!messages.length || messages[0].role !== "user") {
    return json({ error: "messages가 user로 시작해야 합니다" }, 400, cors);
  }

  const { items } = await fetchFestivals(env, { region, numOfRows: 100 });
  const pool = items.slice(0, 60).map(
    (f) => `- ${f.title}${f.ongoing ? " [지금 진행중]" : ""} | 기간: ${f.startDate}~${f.endDate} | 장소: ${f.place || f.address}`
  ).join("\n");

  const now = new Date();
  const todayLabel = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

  const system = SYSTEM_PROMPT +
    `\n\n[오늘 날짜] ${todayLabel} — "이번 주말", "지금", "다음 달" 같은 말은 이 날짜를 기준으로 해석하세요.` +
    `\n\n[실제 축제 목록${region ? ` — ${region}` : " — 전국"}]\n${pool || "(현재 목록을 가져오지 못했습니다. 나중에 다시 시도해달라고 안내하세요.)"}`;

  if (env.GEMINI_API_KEY) return await callGemini(env, system, messages, cors);
  return await callClaude(env, system, messages, cors);
}

// ----- Google Gemini -----
async function callGemini(env, system, messages, cors) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.5 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return json({ error: "gemini " + res.status, detail }, 502, cors);
  }
  const data = await res.json();
  const cand = data.candidates && data.candidates[0];
  if (!cand || cand.finishReason === "SAFETY" || cand.finishReason === "BLOCKLIST") {
    return json({ reply: "이 내용은 도와드리기 어려워요. 다른 걸로 여쭤봐 주시겠어요?" }, 200, cors);
  }
  const reply = ((cand.content && cand.content.parts) || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
  if (!reply) return json({ reply: "다시 한 번 말씀해 주시겠어요?" }, 200, cors);
  return json({ reply }, 200, cors);
}

// ----- Anthropic Claude -----
async function callClaude(env, system, messages, cors) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1024, system, messages }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return json({ error: "anthropic " + res.status, detail }, 502, cors);
  }
  const data = await res.json();
  if (data.stop_reason === "refusal") {
    return json({ reply: "이 내용은 도와드리기 어려워요. 다른 걸로 여쭤봐 주시겠어요?" }, 200, cors);
  }
  const reply = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  return json({ reply }, 200, cors);
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors },
  });
}
