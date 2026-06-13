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
];

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

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

renderList();
