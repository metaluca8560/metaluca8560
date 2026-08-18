/* ================================================================
   우리동네 무슨 축제? — AI 대화 + 실제 축제 추천
   백엔드(Cloudflare Worker, server/ 참고)가 있으면 동작하고,
   없으면( config.js의 FESTIVAL_API_BASE가 "" ) 안내로 폴백합니다.
   ================================================================ */

const API_BASE = (window.FESTIVAL_API_BASE || "").replace(/\/$/, "");
const hasBackend = API_BASE.length > 0;

let currentRegion = "";
let currentRegionLabel = "전국";

// ---------- 지역 선택 ----------
const regionGrid = document.getElementById("regionGrid");
regionGrid.querySelectorAll(".region-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    regionGrid.querySelectorAll(".region-chip").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    currentRegion = btn.dataset.region || "";
    currentRegionLabel = btn.textContent.trim();
    loadFestivals();
  });
});
regionGrid.querySelector('[data-region=""]')?.classList.add("is-on");

// ---------- 축제 목록 ----------
const festList = document.getElementById("festList");
const listTitle = document.getElementById("listTitle");
const ongoingToggle = document.getElementById("ongoingToggle");

let loadedItems = [];
let ongoingOnly = false;
// 지역을 연달아 누르면 늦게 온 응답이 화면을 덮어쓸 수 있어, 마지막 요청만 반영한다.
let loadSeq = 0;

ongoingToggle?.addEventListener("click", () => {
  ongoingOnly = !ongoingOnly;
  ongoingToggle.classList.toggle("is-on", ongoingOnly);
  ongoingToggle.setAttribute("aria-pressed", String(ongoingOnly));
  renderFestivals();
});

async function loadFestivals() {
  listTitle.textContent = `🎪 ${currentRegionLabel} 축제`;
  if (!hasBackend) {
    festList.innerHTML = `<p class="fest-empty">백엔드를 연결하면 축제 목록이 표시돼요.</p>`;
    return;
  }
  const seq = ++loadSeq;
  festList.innerHTML = `<p class="fest-empty">불러오는 중…</p>`;
  try {
    const url = `${API_BASE}/festivals${currentRegion ? `?region=${encodeURIComponent(currentRegion)}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    if (seq !== loadSeq) return;
    // 200이어도 본문에 error가 담겨 올 수 있다(공공데이터 특성).
    if (data.error) throw new Error(data.error);
    loadedItems = Array.isArray(data.items) ? data.items : [];
    renderFestivals();
  } catch (err) {
    if (seq !== loadSeq) return;
    loadedItems = [];
    festList.innerHTML = `<p class="fest-empty">목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      <button type="button" class="retry-btn" id="retryBtn">다시 시도</button></p>`;
    document.getElementById("retryBtn")?.addEventListener("click", loadFestivals);
  }
}

function renderFestivals() {
  const items = ongoingOnly ? loadedItems.filter((f) => f.ongoing) : loadedItems;
  const ongoingCount = loadedItems.filter((f) => f.ongoing).length;

  if (ongoingToggle) {
    ongoingToggle.hidden = ongoingCount === 0 && !ongoingOnly;
    ongoingToggle.textContent = `지금 열리는 것만 (${ongoingCount})`;
  }

  if (!items.length) {
    festList.innerHTML = ongoingOnly
      ? `<p class="fest-empty">지금 열리고 있는 축제가 없어요. 아래 버튼을 다시 눌러 전체를 보세요.</p>`
      : `<p class="fest-empty">이 지역은 등록된 축제가 없어요. 다른 지역을 골라보세요.</p>`;
    return;
  }

  festList.innerHTML = items.map(festivalCard).join("");

  // 관광공사 이미지 URL이 종종 깨진다. 실패하면 빈 상자 대신 이모지로 바꾼다.
  festList.querySelectorAll("img.fi-thumb").forEach((img) => {
    img.addEventListener("error", () => {
      const ph = document.createElement("div");
      ph.className = "fi-thumb fi-noimg";
      ph.textContent = "🎪";
      img.replaceWith(ph);
    }, { once: true });
  });
}

function festivalCard(f) {
  const where = f.place || f.address || "";
  const period = f.startDate === f.endDate ? f.startDate : `${f.startDate} ~ ${f.endDate}`;
  const mapQuery = encodeURIComponent(f.address || f.title);
  return `
    <article class="fest-item${f.ongoing ? " is-ongoing" : ""}">
      ${f.image
        ? `<img class="fi-thumb" src="${escapeHtml(f.image)}" alt="" loading="lazy" />`
        : `<div class="fi-thumb fi-noimg">🎪</div>`}
      <div class="fi-body">
        <div class="fi-title">
          ${f.ongoing ? `<span class="fi-badge">지금 진행중</span>` : ""}
          ${escapeHtml(f.title)}
        </div>
        <div class="fi-when">${escapeHtml(period)}</div>
        ${where ? `<div class="fi-where">${escapeHtml(where)}</div>` : ""}
        <div class="fi-actions">
          <a class="fi-link" href="https://map.kakao.com/?q=${mapQuery}" target="_blank" rel="noopener">지도</a>
          ${f.tel ? `<a class="fi-link" href="tel:${escapeHtml(f.tel)}">${escapeHtml(f.tel)}</a>` : ""}
        </div>
      </div>
    </article>`;
}

// ---------- AI 채팅 ----------
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatNote = document.getElementById("chatNote");
const history = [];

function bubble(role, text) {
  const el = document.createElement("div");
  el.className = "msg msg-" + role;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

if (!hasBackend) {
  bubble("bot", "AI 큐레이터는 백엔드(무료 Cloudflare Worker)를 연결하면 켜져요. 설정 방법은 server/README.md를 참고해 주세요.");
  chatNote.hidden = false;
  chatNote.innerHTML = "설정 방법: <code>festival/server/README.md</code> 참고 → 배포 후 <code>config.js</code>의 <code>FESTIVAL_API_BASE</code>에 주소를 넣으면 됩니다.";
  chatInput.disabled = true;
  chatForm.querySelector(".chat-send").disabled = true;
} else {
  bubble("bot", "안녕하세요! 어느 동네 축제가 궁금하세요? 위에서 지역 골라주시고, 언제 놀러가고 싶은지 편하게 말씀해 주세요.");
  const chips = document.getElementById("chatChips");
  if (chips) {
    chips.hidden = false;
    chips.querySelectorAll(".chip").forEach((c) => {
      c.addEventListener("click", () => { chatInput.value = c.textContent; chatInput.focus(); });
    });
  }
}

chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !hasBackend) return;

  bubble("user", text);
  history.push({ role: "user", content: text });
  chatInput.value = "";
  chatInput.disabled = true;

  const thinking = bubble("bot", "…");
  try {
    const res = await fetch(API_BASE + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, region: currentRegion }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    const reply = (data.reply || "").trim() || "다시 한 번 말씀해 주시겠어요?";
    renderBotReply(thinking, reply);
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    thinking.textContent = "연결에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

function renderBotReply(thinkingEl, reply) {
  const m = reply.match(/<card>([\s\S]*?)<\/card>/);
  let card = null;
  if (m) {
    try { card = JSON.parse(m[1].trim()); } catch (e) { card = null; }
  }
  const text = reply.replace(/<card>[\s\S]*?<\/card>/, "").trim();

  // picks가 비어 있으면 카드를 그리지 않는다 — AI 답변 텍스트가 이미 같은 말을 하고 있어서
  // 카드까지 띄우면 "없어요"가 두 번 나온다.
  if (card && Array.isArray(card.picks) && card.picks.length) {
    const cardEl = buildPickCard(card);
    chatBox.insertBefore(cardEl, thinkingEl);
  }
  if (text) {
    thinkingEl.textContent = text;
  } else {
    thinkingEl.remove();
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function buildPickCard(data) {
  const picks = data.picks;
  const el = document.createElement("div");
  el.className = "pick-list";
  el.innerHTML = picks.map((p) => `
    <div class="pick-card">
      <div class="pk-title">🎪 ${escapeHtml(p.title || "")}</div>
      ${p.when ? `<div class="pk-when">${escapeHtml(p.when)}</div>` : ""}
      ${p.where ? `<div class="pk-where">${escapeHtml(p.where)}</div>` : ""}
      ${p.why ? `<div class="pk-why">${escapeHtml(p.why)}</div>` : ""}
    </div>`).join("");
  return el;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

document.getElementById("year").textContent = new Date().getFullYear();

// 첫 화면에서 전국 목록을 바로 보여준다.
loadFestivals();
