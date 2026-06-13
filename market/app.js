/* ================================================================
   동네 장날 — 우리 동네 전통시장 길잡이 (MVP)
   ----------------------------------------------------------------
   ✏️ 우리 동네 시장으로 바꾸려면 아래 MARKETS 배열만 수정하세요.
   - type: "5일장" 이면 ohDigits에 장 서는 "날짜 끝자리"를 적어요.
       예) 4·9일장 → ohDigits: [4, 9]   /  5·10일장 → [5, 0]
     "상설" 이면 매일 영업(ohDigits 불필요).
   - lat/lng: 길찾기·지도 버튼에 쓰여요(카카오맵). 모르면 비워도 됩니다.
   ================================================================ */

const MARKETS = [
  {
    id: "moran",
    name: "모란민속 5일장",
    region: "경기 성남시 중원구 (모란역 인근)",
    type: "5일장",
    ohDigits: [4, 9],          // 끝자리 4, 9일에 장이 섭니다 (4·9일장)
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "전국에서 손꼽히는 큰 5일장. 농수산물부터 약초·묘목·만물까지 없는 게 없어요.",
    specialties: ["잡곡·약초", "묘목·화초", "건어물", "장터 먹거리"],
    foods: [
      { name: "옛날 손칼국수·잔치국수", desc: "장터 한 바퀴 돌고 든든하게. 가격도 착해요." },
      { name: "순대·순대국밥", desc: "갓 삶은 순대에 국밥 한 그릇이면 속이 든든." },
      { name: "제철 나물·말린 나물", desc: "곤드레·취나물 등은 데쳐서 무침·밥에 활용하기 좋아요." },
    ],
    shops: [
      { name: "약초·잡곡 골목", desc: "건강원·약재 가게가 모여 있어 비교하며 고르기 좋아요." },
      { name: "묘목·화초 코너", desc: "봄철엔 모종·묘목, 철마다 화초가 다양하게 나와요." },
    ],
    transport: {
      bus: [
        { no: "예시 51", info: "모란역 정류장 하차 (배차·시간은 확인 필요)" },
        { no: "예시 200", info: "모란시장 입구 인근 정차" },
      ],
      subway: "수도권 지하철 8호선·분당선 모란역에서 도보 약 5분",
      note: "장날(끝자리 4·9일)엔 매우 붐벼요. 대중교통 권장!",
    },
    lat: 37.4329, lng: 127.1295,
  },
  {
    id: "gwangjang",
    name: "광장시장",
    region: "서울 종로구 (종로5가 인근)",
    type: "상설",
    hours: "상점마다 다름 / 먹자골목 보통 09:00 ~ 23:00",
    intro: "100년 넘은 서울 대표 상설시장. 먹거리·구제·한복·이불까지, 특히 먹자골목이 명물이에요.",
    specialties: ["빈대떡", "마약김밥", "육회", "생선·모둠전"],
    foods: [
      { name: "녹두 빈대떡", desc: "바삭하게 부친 빈대떡은 막걸리와 찰떡. 시장의 시그니처." },
      { name: "마약김밥", desc: "겨자장에 콕 찍어 먹는 작은 김밥. 간식으로 딱." },
      { name: "육회·육사시미", desc: "신선한 육회 한 접시. 비빔으로도 즐겨요." },
    ],
    shops: [
      { name: "먹자골목", desc: "빈대떡·김밥·전집이 줄지어 있어요. 줄 짧은 곳부터 도전!" },
      { name: "구제·수입 골목", desc: "빈티지 옷·원단을 저렴하게. 발품 팔수록 보물 발견." },
    ],
    transport: {
      bus: [
        { no: "예시 101", info: "종로5가 정류장 하차 후 도보 2분 (확인 필요)" },
      ],
      subway: "지하철 1호선 종로5가역, 2·5호선 을지로4가역에서 도보 5분 내외",
      note: "주말엔 먹자골목이 많이 붐벼요. 평일 낮이 한산해요.",
    },
    lat: 37.5701, lng: 127.0006,
  },

  // ===== 전국 구석구석 시골 미니 5일장 =====
  {
    id: "jeongseon",
    name: "정선아리랑시장",
    region: "강원 정선군 정선읍 (시골 5일장)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장
    hours: "보통 08:00 ~ 17:00 (장날)",
    intro: "산골 정취 가득한 강원도 대표 5일장. 약초와 산나물, 토속 먹거리가 일품이에요.",
    specialties: ["곤드레·산나물", "황기·약초", "수리취떡", "메밀"],
    foods: [
      { name: "곤드레밥", desc: "곤드레나물을 넣어 지은 밥에 양념장 슥슥. 정선의 맛." },
      { name: "콧등치기국수", desc: "메밀국수를 후루룩 먹다 콧등을 친다고 붙은 이름. 별미!" },
      { name: "수리취떡·메밀전병", desc: "장터 간식으로 딱. 따끈할 때가 제일 맛있어요." },
    ],
    shops: [
      { name: "약초·산나물 골목", desc: "황기·곤드레 등 산에서 난 것들을 직접 보고 살 수 있어요." },
    ],
    transport: {
      bus: [{ no: "정선 시내버스", info: "정선시장 정류장 인근 (시간 확인 필요)" }],
      subway: "정선아리랑열차(A-train)로 정선역 → 시장까지 버스/택시",
      note: "관광열차 타고 장날 맞춰 가면 여행 코스로 딱이에요.",
    },
    lat: 37.3805, lng: 128.6608,
  },
  {
    id: "bongpyeong",
    name: "봉평장 (봉평 5일장)",
    region: "강원 평창군 봉평면 (시골 5일장)",
    type: "5일장",
    ohDigits: [2, 7],          // 2·7일장
    hours: "보통 09:00 ~ 17:00 (장날)",
    intro: "「메밀꽃 필 무렵」의 그 봉평. 메밀로 시작해 메밀로 끝나는 정겨운 시골장이에요.",
    specialties: ["메밀(막국수·전병)", "감자", "산나물", "토종꿀"],
    foods: [
      { name: "메밀막국수", desc: "봉평 메밀로 뽑은 면. 시원하게 한 그릇이면 더위가 싹." },
      { name: "메밀전병·메밀부침", desc: "속이 꽉 찬 전병은 장터 대표 간식이에요." },
    ],
    shops: [
      { name: "메밀 먹거리 골목", desc: "막국수·전병집이 모여 있어요. 효석문화마을도 가까워요." },
    ],
    transport: {
      bus: [{ no: "평창 시내버스", info: "봉평시장 인근 하차 (시간 확인 필요)" }],
      subway: "기차편 없음 — 시외버스(장평/봉평) 또는 자가용 이용",
      note: "9월 효석문화제 즈음 메밀꽃밭과 함께 보면 좋아요.",
    },
    lat: 37.5639, lng: 128.3331,
  },
  {
    id: "hwagae",
    name: "화개장터",
    region: "경남 하동군 화개면 (옛 5일장·상설)",
    type: "상설",
    hours: "보통 09:00 ~ 18:00 (상점마다 다름)",
    intro: "지리산과 섬진강이 만나는 곳. 영호남 사람들이 모이던 정겨운 장터예요.",
    specialties: ["하동 녹차", "산나물·고사리", "섬진강 재첩", "약초"],
    foods: [
      { name: "재첩국·재첩비빔밥", desc: "섬진강 재첩으로 끓인 시원한 국. 해장으로 그만이에요." },
      { name: "산나물 비빔밥", desc: "지리산 나물 듬뿍. 봄이면 종류가 더 다양해요." },
    ],
    shops: [
      { name: "약초·산나물 전", desc: "말린 나물·약초가 가득. 향부터 다릅니다." },
      { name: "하동 녹차 가게", desc: "햇차 철엔 갓 덖은 녹차를 맛볼 수 있어요." },
    ],
    transport: {
      bus: [{ no: "하동 농어촌버스", info: "화개장터 정류장 하차 (시간 확인 필요)" }],
      subway: "기차편 없음 — 하동/구례 시외버스 또는 자가용",
      note: "벚꽃철(4월) 화개십리벚꽃길과 함께 가면 환상적이에요.",
    },
    lat: 35.1721, lng: 127.6258,
  },
  {
    id: "punggi",
    name: "풍기인삼시장",
    region: "경북 영주시 풍기읍 (상설)",
    type: "상설",
    hours: "보통 09:00 ~ 19:00 (상점마다 다름)",
    intro: "예부터 인삼으로 이름난 풍기. 인삼과 영주 사과를 한자리에서 만나요.",
    specialties: ["풍기인삼", "영주 사과", "인삼 가공품", "약초"],
    foods: [
      { name: "인삼튀김", desc: "수삼을 바삭하게 튀겨낸 별미. 장터 간식으로 인기예요." },
      { name: "인삼갈비탕·삼계", desc: "인삼 넣어 푹 끓인 보양식. 기운 없을 때 좋아요." },
    ],
    shops: [
      { name: "인삼 상가 거리", desc: "수삼·홍삼·가공품을 비교하며 고르기 좋아요." },
    ],
    transport: {
      bus: [{ no: "영주 시내버스", info: "풍기시장 인근 하차 (시간 확인 필요)" }],
      subway: "중앙선 풍기역에서 가까워요(도보·택시).",
      note: "가을 영주 사과철엔 사과도 꼭 챙겨보세요.",
    },
    lat: 36.8703, lng: 128.5236,
  },
];

// ===== 계절별(이번 달) 제철 식재료 — 지역·해마다 조금씩 달라요 =====
const SEASONAL = {
  1: ["굴", "딸기", "한라봉", "시금치", "우엉", "과메기", "대구"],
  2: ["딸기", "바지락", "냉이", "봄동", "미나리", "한라봉", "도미"],
  3: ["냉이", "달래", "쑥", "봄동", "주꾸미", "바지락", "더덕"],
  4: ["두릅", "죽순", "달래", "쑥", "주꾸미", "멍게", "미나리"],
  5: ["마늘종", "죽순", "두릅", "매실", "멸치", "다슬기", "완두콩"],
  6: ["감자", "마늘", "양파", "매실", "살구", "한치", "토마토", "보리"],
  7: ["옥수수", "복숭아", "자두", "수박", "참외", "가지", "애호박", "민어"],
  8: ["복숭아", "포도", "옥수수", "전복", "토마토", "풋고추", "고구마순"],
  9: ["사과", "배", "밤", "대하", "전어", "토란", "햇고구마", "햅쌀"],
  10: ["사과", "배", "감", "꽃게", "대하", "고등어", "무", "배추"],
  11: ["귤", "사과", "배추", "무", "굴", "과메기", "대게", "단호박"],
  12: ["굴", "귤", "한라봉", "시금치", "배추", "방어", "명태", "유자"],
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 5일장 다음 장날 계산 (끝자리 기준)
function nextMarketDay(ohDigits) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 12; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    if (ohDigits.includes(d.getDate() % 10)) return { date: d, dday: i };
  }
  return null;
}

function ddayText(ohDigits) {
  const n = nextMarketDay(ohDigits);
  if (!n) return { label: "장날 정보 확인 필요", today: false };
  const m = n.date.getMonth() + 1, day = n.date.getDate(), w = WEEK[n.date.getDay()];
  if (n.dday === 0) return { label: `🎉 오늘 장날! (${m}/${day} ${w})`, today: true };
  return { label: `다음 장날 ${m}/${day}(${w}) · D-${n.dday}`, today: false };
}

// ---------- 목록 렌더 ----------
const listView = document.getElementById("listView");
const detailView = document.getElementById("detailView");
const marketList = document.getElementById("marketList");
let curFilter = "all";

function renderList() {
  const items = MARKETS.filter((m) => curFilter === "all" || m.type === curFilter);
  marketList.innerHTML = items.map((m) => {
    const badge = m.type === "5일장"
      ? `<span class="mc-badge badge-5">5일장</span>`
      : `<span class="mc-badge badge-everyday">상설</span>`;
    let dday = "";
    if (m.type === "5일장") {
      const d = ddayText(m.ohDigits);
      dday = `<div class="mc-dday ${d.today ? "today" : ""}">🗓️ ${d.label}</div>`;
    } else {
      dday = `<div class="mc-dday">🟢 매일 영업</div>`;
    }
    const chips = (m.specialties || []).slice(0, 4).map((s) => `<span>${esc(s)}</span>`).join("");
    return `<div class="market-card" data-id="${m.id}">
      <div class="mc-top"><span class="mc-name">${esc(m.name)}</span>${badge}</div>
      <div class="mc-region">📍 ${esc(m.region)}</div>
      ${dday}
      <div class="mc-chips">${chips}</div>
      <div class="mc-go">자세히 보기 →</div>
    </div>`;
  }).join("");
  marketList.querySelectorAll(".market-card").forEach((c) => {
    c.addEventListener("click", () => showDetail(c.dataset.id));
  });
}

// ---------- 상세 렌더 ----------
function showDetail(id) {
  const m = MARKETS.find((x) => x.id === id);
  if (!m) return;
  const badge = m.type === "5일장"
    ? `<span class="mc-badge badge-5">5일장</span>` : `<span class="mc-badge badge-everyday">상설</span>`;

  let schedule;
  if (m.type === "5일장") {
    const d = ddayText(m.ohDigits);
    const digits = m.ohDigits.join("·");
    schedule = `<div class="d-row"><span class="k">장날</span><span>끝자리 <strong>${digits}</strong>일 (5일장)</span></div>
      <div class="d-row"><span class="k">다음</span><span class="d-dday ${d.today ? "today" : ""}">${d.label}</span></div>`;
  } else {
    schedule = `<div class="d-row"><span class="k">영업</span><span><strong>매일 영업</strong> (상설시장)</span></div>`;
  }

  const busRows = (m.transport?.bus || []).map((b) =>
    `<div class="bus-line"><span class="bus-no">${esc(b.no)}</span><span>${esc(b.info)}</span></div>`).join("")
    || `<p class="muted" style="font-size:14px">버스 정보를 추가해 주세요.</p>`;

  const foods = (m.foods || []).map((f) =>
    `<div class="food-item"><strong>🍜 ${esc(f.name)}</strong><p>${esc(f.desc)}</p></div>`).join("");
  const shops = (m.shops || []).map((s) =>
    `<div class="shop-item"><strong>🏪 ${esc(s.name)}</strong><p>${esc(s.desc)}</p></div>`).join("");
  const specs = (m.specialties || []).map((s) => `<span>${esc(s)}</span>`).join("");

  const hasGeo = m.lat && m.lng;
  const dirUrl = hasGeo ? `https://map.kakao.com/link/to/${encodeURIComponent(m.name)},${m.lat},${m.lng}` : `https://map.kakao.com/?q=${encodeURIComponent(m.name)}`;
  const mapUrl = hasGeo ? `https://map.kakao.com/link/map/${encodeURIComponent(m.name)},${m.lat},${m.lng}` : `https://map.kakao.com/?q=${encodeURIComponent(m.name)}`;

  detailView.innerHTML = `
    <button class="back-btn" id="backBtn">← 목록으로</button>
    <div class="detail-head">
      <h1>${esc(m.name)}</h1>
      <div class="mc-region">📍 ${esc(m.region)}</div>
      ${badge}
      <p class="d-intro">${esc(m.intro || "")}</p>
    </div>

    <div class="d-block">
      <h2>🗓️ 운영 · 장날</h2>
      ${schedule}
      <div class="d-row"><span class="k">시간</span><span>${esc(m.hours || "확인 필요")}</span></div>
    </div>

    <div class="d-block">
      <h2>🔥 이 시장의 주무기</h2>
      <div class="spec-chips">${specs}</div>
      <div style="margin-top:14px">${foods}</div>
    </div>

    ${shops ? `<div class="d-block"><h2>🏪 대표 가게·코너</h2>${shops}</div>` : ""}

    <div class="d-block">
      <h2>🚌 가는 길</h2>
      ${busRows}
      ${m.transport?.subway ? `<div class="d-row"><span class="k">지하철</span><span>${esc(m.transport.subway)}</span></div>` : ""}
      ${m.transport?.note ? `<div class="d-row"><span class="k">팁</span><span>${esc(m.transport.note)}</span></div>` : ""}
      <div class="d-actions">
        <a class="d-btn primary" href="${dirUrl}" target="_blank" rel="noopener">🧭 길찾기</a>
        <a class="d-btn ghost" href="${mapUrl}" target="_blank" rel="noopener">🗺️ 지도에서 보기</a>
      </div>
    </div>`;

  listView.hidden = true;
  detailView.hidden = false;
  document.getElementById("backBtn").addEventListener("click", showList);
  window.scrollTo({ top: 0 });
}

function showList() {
  detailView.hidden = true;
  listView.hidden = false;
  window.scrollTo({ top: 0 });
}

// ---------- 필터 / 공통 ----------
document.getElementById("filters").querySelectorAll(".filter").forEach((b) => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((x) => x.classList.remove("is-on"));
    b.classList.add("is-on");
    curFilter = b.dataset.f;
    renderList();
  });
});
document.getElementById("homeBtn").addEventListener("click", (e) => { e.preventDefault(); showList(); });
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- 이번 달 제철 식재료 ----------
function renderSeasonal() {
  const box = document.getElementById("seasonal");
  if (!box) return;
  const month = new Date().getMonth() + 1;
  const items = SEASONAL[month] || [];
  box.innerHTML = `
    <div class="seasonal-card">
      <h2>🥬 ${month}월 제철 식재료</h2>
      <p class="muted">시장 가서 이것부터 찾아보세요! 제일 맛있고 저렴할 때예요.</p>
      <div class="season-chips">${items.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
    </div>`;
}
renderSeasonal();

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

renderList();
