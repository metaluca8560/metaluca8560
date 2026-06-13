/* ================================================================
   오늘 어디 아파? — 증상 안내 길잡이 (MVP, 룰 기반)
   ⚠️ 진단이 아닌 참고용 안내. 레드플래그 우선, 119 강조.
   업그레이드(2단계): app.js의 decide()를 Claude API 호출로 교체하면
   AI가 대화로 문진. 단, 아래 RED_FLAGS는 항상 가드레일로 유지할 것.
   ================================================================ */

document.getElementById("year").textContent = new Date().getFullYear();

// DOM 헬퍼
function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}

// ----- 모드 (어르신/일반/아이) -----
let MODE = "senior";
const modeBtns = document.querySelectorAll(".mode-btn");
modeBtns.forEach((b) => {
  b.addEventListener("click", () => {
    MODE = b.dataset.mode;
    modeBtns.forEach((x) => x.classList.toggle("is-on", x === b));
    document.body.className = MODE;
    restart(); // 모드 바뀌면 문진 처음부터
  });
});

// ----- 부위 데이터 (성인 기준 + 아이 보정) -----
const REGIONS = [
  { id: "head",  ico: "🤕", label: "머리·어지럼",      depts: ["신경과", "내과"],            base: 1,
    care: ["밝은 빛·소음을 피하고 충분히 쉬세요.", "수분을 섭취하고 무리한 활동을 줄이세요."] },
  { id: "eye",   ico: "👁️", label: "눈",              depts: ["안과"],                     base: 0,
    care: ["눈을 비비지 말고 깨끗한 손으로만 만지세요.", "콘택트렌즈는 빼고 안경을 사용하세요."] },
  { id: "ent",   ico: "👂", label: "귀·코·목·인후",     depts: ["이비인후과", "내과"],         base: 0,
    care: ["따뜻한 물을 자주 마시고 목을 보호하세요.", "실내 습도를 유지하세요."] },
  { id: "chest", ico: "🫀", label: "가슴·심장·호흡",     depts: ["순환기내과", "호흡기내과"],    base: 2,
    care: ["증상이 있을 때 무리한 움직임을 멈추고 안정을 취하세요."] },
  { id: "abd",   ico: "🍽️", label: "배·속·소화",        depts: ["소화기내과", "내과"],         base: 1,
    care: ["기름지고 자극적인 음식을 피하세요.", "수분을 조금씩 자주 보충하세요."] },
  { id: "urin",  ico: "🚽", label: "소변·비뇨",          depts: ["비뇨의학과"],                base: 1,
    care: ["물을 충분히 마시세요.", "참지 말고 자주 배뇨하세요."] },
  { id: "back",  ico: "🧍", label: "등·허리",            depts: ["정형외과", "신경외과"],       base: 1,
    care: ["무거운 것을 들지 말고 바른 자세를 유지하세요.", "급성기엔 무리한 스트레칭을 피하세요."] },
  { id: "limb",  ico: "🦵", label: "팔다리·관절·근육",    depts: ["정형외과"],                  base: 0,
    care: ["다친 부위는 안정·냉찜질(초기)·압박·거상(R.I.C.E)을 기억하세요."] },
  { id: "skin",  ico: "🩹", label: "피부",              depts: ["피부과"],                    base: 0,
    care: ["긁지 말고 자극을 피하세요.", "새 화장품·약물 사용을 중단해 보세요."] },
  { id: "fever", ico: "🌡️", label: "열·몸살·전신",       depts: ["내과", "가정의학과"],         base: 1,
    care: ["수분을 충분히 섭취하고 쉬세요.", "해열은 권장 용량을 지키세요."] },
  { id: "mind",  ico: "🫂", label: "마음·불안·수면",      depts: ["정신건강의학과"],            base: 0,
    care: ["혼자 견디지 마세요. 가까운 사람에게 이야기하세요.", "힘들 땐 1393(자살예방) 상담이 24시간 열려 있어요."] },
  { id: "etc",   ico: "❓", label: "기타·잘 모름",        depts: ["가정의학과"],                base: 0,
    care: ["증상을 메모해 두면 진료에 도움이 됩니다."] },
];

// 아이 모드: 소아청소년과 우선
function deptsFor(region) {
  if (MODE === "child") {
    if (["mind"].includes(region.id)) return ["소아청소년과", "소아정신건강의학과"];
    return ["소아청소년과", ...region.depts];
  }
  return region.depts;
}

// ----- 레드플래그 (하나라도 해당 → 즉시 119/응급실) -----
const RED_FLAGS = [
  "의식이 흐리거나 깨워도 잘 반응하지 않아요",
  "갑자기 한쪽 팔다리에 힘이 빠지거나 말이 어눌해요",
  "숨쉬기가 매우 힘들거나 입술이 파래져요",
  "갑작스럽고 심한 가슴 통증이 팔·턱·등으로 퍼져요",
  "피를 토하거나, 검은 변·멈추지 않는 출혈이 있어요",
  "생애 가장 심한 갑작스러운 두통이에요",
  "고열과 함께 경련(발작)을 했어요",
];
const RED_FLAGS_CHILD = [
  "축 처지고 잘 먹지 못하며 소변이 거의 없어요(탈수)",
  "생후 3개월 미만인데 38℃ 이상 열이 나요",
];

// ----- 문진 단계 정의 -----
const FEVER = [
  { v: 0, ico: "🙂", t: "없어요" },
  { v: 1, ico: "🌡️", t: "미열(~37.5℃)" },
  { v: 2, ico: "🔥", t: "38℃ 이상" },
  { v: 0, ico: "🤷", t: "잘 모르겠어요" },
];
const SEVERITY = [
  { v: 0, ico: "🟢", t: "가벼워요" },
  { v: 1, ico: "🟡", t: "보통이에요" },
  { v: 2, ico: "🔴", t: "심해요" },
];
const DURATION = [
  { v: 1, ico: "⚡", t: "오늘 갑자기" },
  { v: 0, ico: "📅", t: "며칠 됐어요" },
  { v: 0, ico: "🗓️", t: "몇 주 이상", chronic: true },
];

// ----- 상태 -----
const state = { region: null, fever: null, severity: null, duration: null, flags: new Set() };
let stepIndex = 0;
const STEPS = ["region", "fever", "severity", "duration", "redflag"];

const stepEl = document.getElementById("step");
const progress = document.getElementById("progress");
const bar = document.getElementById("bar");
const backBtn = document.getElementById("backBtn");
const resultEl = document.getElementById("result");

backBtn.addEventListener("click", () => { if (stepIndex > 0) { stepIndex--; render(); } });

function restart() {
  state.region = null; state.fever = null; state.severity = null; state.duration = null; state.flags = new Set();
  stepIndex = 0;
  resultEl.hidden = true; resultEl.innerHTML = "";
  render();
}

function render() {
  const key = STEPS[stepIndex];
  progress.hidden = false;
  bar.style.width = ((stepIndex) / STEPS.length) * 100 + "%";
  backBtn.style.visibility = stepIndex === 0 ? "hidden" : "visible";

  if (key === "region") renderChoice({
    title: "어디가 불편하세요?",
    help: "가장 불편한 곳을 하나 골라주세요.",
    items: REGIONS.map((r) => ({ ico: r.ico, t: r.label, sel: state.region === r.id, on: () => { state.region = r.id; next(); } })),
  });

  if (key === "fever") renderChoice({
    title: "열이 있나요?",
    items: FEVER.map((f, i) => ({ ico: f.ico, t: f.t, sel: state.fever === i, on: () => { state.fever = i; next(); } })),
  });

  if (key === "severity") renderChoice({
    title: "지금 불편한 정도는요?",
    items: SEVERITY.map((s, i) => ({ ico: s.ico, t: s.t, sel: state.severity === i, on: () => { state.severity = i; next(); } })),
  });

  if (key === "duration") renderChoice({
    title: "언제부터 그랬어요?",
    items: DURATION.map((d, i) => ({ ico: d.ico, t: d.t, sel: state.duration === i, on: () => { state.duration = i; next(); } })),
  });

  if (key === "redflag") renderRedflags();
}

// 선택형 단계 렌더
function renderChoice({ title, help, items }) {
  stepEl.innerHTML = "";
  stepEl.appendChild(h("p", "q-title", title));
  if (help) stepEl.appendChild(h("p", "q-help", help));
  const grid = h("div", "opts" + (items.length <= 3 ? " one" : ""));
  items.forEach((it) => {
    const b = h("button", "opt" + (it.sel ? " is-sel" : ""));
    b.type = "button";
    b.innerHTML = `<span class="ico">${it.ico}</span><span>${it.t}</span>`;
    b.addEventListener("click", it.on);
    grid.appendChild(b);
  });
  stepEl.appendChild(grid);
}

// 레드플래그 단계 (마지막)
function renderRedflags() {
  const flags = MODE === "child" ? [...RED_FLAGS, ...RED_FLAGS_CHILD] : RED_FLAGS;
  stepEl.innerHTML = "";
  stepEl.appendChild(h("p", "q-title", "혹시 이런 위험 신호가 있나요?"));
  stepEl.appendChild(h("p", "q-help", "해당하는 항목을 모두 눌러주세요. 없으면 아래 '결과 보기'를 누르세요."));
  const list = h("div", "redflag-list");
  flags.forEach((txt) => {
    const b = h("button", "opt danger" + (state.flags.has(txt) ? " is-sel" : ""));
    b.type = "button";
    b.innerHTML = `<span class="ico">⚠️</span><span>${txt}</span>`;
    b.addEventListener("click", () => {
      if (state.flags.has(txt)) state.flags.delete(txt); else state.flags.add(txt);
      b.classList.toggle("is-sel");
    });
    list.appendChild(b);
  });
  stepEl.appendChild(list);
  const actions = h("div", "flow-actions");
  const go = h("button", "btn"); go.type = "button"; go.textContent = "결과 보기";
  go.addEventListener("click", showResult);
  actions.appendChild(go);
  stepEl.appendChild(actions);
}

function next() {
  if (stepIndex < STEPS.length - 1) { stepIndex++; render(); }
}

// ----- 판단 로직 (룰 기반) -----
function decide() {
  const region = REGIONS.find((r) => r.id === state.region) || REGIONS[REGIONS.length - 1];
  const hasFlag = state.flags.size > 0;

  // 점수 누적
  let score = region.base;
  score += SEVERITY[state.severity ?? 0]?.v ?? 0;
  score += FEVER[state.fever ?? 0]?.v ?? 0;
  score += DURATION[state.duration ?? 1]?.v ?? 0;
  if (MODE === "senior") score += 1;                 // 어르신: 더 보수적으로
  if (MODE === "child" && (state.fever ?? 0) >= 2) score += 1;

  // 응급도 결정 (레드플래그는 무조건 RED)
  let level;
  if (hasFlag || score >= 4) level = "red";
  else if (score >= 2) level = "yellow";
  else level = "green";

  const chronic = DURATION[state.duration ?? 1]?.chronic;
  return { region, level, hasFlag, chronic, depts: deptsFor(region) };
}

// ----- 결과 렌더 -----
function showResult() {
  const r = decide();
  bar.style.width = "100%";

  const U = {
    red:    { cls: "u-red",    badge: "🚑", t: "지금 바로 진료가 필요해요", s: "응급실 방문 또는 119에 연락하세요." },
    yellow: { cls: "u-yellow", badge: "⏱️", t: "가능한 빨리 진료받으세요", s: "오늘 중 병원 방문을 권해요." },
    green:  { cls: "u-green",  badge: "🟢", t: "급하지는 않아 보여요", s: "증상이 지속되면 외래 진료를 받으세요." },
  }[r.level];

  let html = `
    <div class="urgency ${U.cls}">
      <span class="badge">${U.badge}</span>
      <span class="u-text"><strong>${U.t}</strong><span>${U.s}</span></span>
    </div>
    <h2>안내 결과</h2>
    <p class="muted">입력하신 증상을 바탕으로 한 <strong>참고용 안내</strong>예요. 확정 진단이 아닙니다.</p>
    <div class="res-block">
      <h3>🏥 이런 진료과를 권해요</h3>
      <div class="dept-chips">${r.depts.map((d) => `<span>${d}</span>`).join("")}</div>
    </div>`;

  if (r.hasFlag) {
    html += `<div class="res-block warn">
      <h3>⚠️ 위험 신호가 확인됐어요</h3>
      <p>선택하신 항목은 빠른 처치가 필요할 수 있는 신호예요. <strong>망설이지 말고 119에 연락하거나 응급실로 가세요.</strong></p>
    </div>`;
  } else {
    html += `<div class="res-block">
      <h3>🏠 집에서 이렇게 해보세요</h3>
      <ul>${r.region.care.map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>`;
    if (r.chronic) {
      html += `<div class="res-block"><h3>📌 참고</h3><ul><li>몇 주 이상 이어지는 증상은 한 번 진료로 원인을 확인하는 게 좋아요.</li></ul></div>`;
    }
    html += `<div class="res-block warn">
      <h3>이럴 땐 즉시 병원·119</h3>
      <ul><li>증상이 갑자기 심해지거나, 숨쉬기·의식·말·움직임에 이상이 생기면 지체 없이 응급실로 가세요.</li></ul>
    </div>`;
  }

  html += `<div class="res-actions">
      <button class="btn" id="toFinder">📍 주변 병원·약국 찾기</button>
      <button class="btn btn-ghost" id="again">다시 진단</button>
    </div>`;

  resultEl.innerHTML = html;
  resultEl.hidden = false;
  progress.hidden = true;
  stepEl.innerHTML = `<p class="q-help">아래 결과를 확인하세요 👇</p>`;
  document.getElementById("again").addEventListener("click", () => { restart(); window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.getElementById("toFinder").addEventListener("click", () => document.getElementById("finder").scrollIntoView({ behavior: "smooth" }));
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ----- 주변 찾기 (위치기반 지도 검색, API 키 불필요) -----
const finderNote = document.getElementById("finderNote");
document.querySelectorAll(".find-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.q;
    finderNote.hidden = false;
    finderNote.textContent = "위치를 확인하는 중이에요…";
    if (!navigator.geolocation) return openMap(q, null);
    navigator.geolocation.getCurrentPosition(
      (pos) => openMap(q, pos.coords),
      () => { finderNote.textContent = "위치 권한이 없어 지역 검색으로 열어요."; openMap(q, null); },
      { timeout: 8000 }
    );
  });
});
function openMap(q, coords) {
  // 구글 지도 검색: 좌표가 있으면 내 위치 주변, 없으면 일반 검색
  const url = coords
    ? `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${coords.latitude},${coords.longitude},15z`
    : `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  finderNote.textContent = coords ? "내 위치 주변 결과를 새 창에서 열었어요." : "지도 검색을 새 창에서 열었어요.";
  window.open(url, "_blank", "noopener");
}

// 시작
render();
