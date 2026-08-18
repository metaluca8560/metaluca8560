/* ================================================================
   우리동네 무슨 축제? — AI 대화 + 실제 축제 추천
   백엔드(Cloudflare Worker, server/ 참고)가 있으면 동작하고,
   없으면( config.js의 FESTIVAL_API_BASE가 "" ) 안내로 폴백합니다.
   ================================================================ */

const API_BASE = (window.FESTIVAL_API_BASE || "").replace(/\/$/, "");
const hasBackend = API_BASE.length > 0;

let currentRegion = "";

// ---------- 지역 선택 ----------
const regionGrid = document.getElementById("regionGrid");
regionGrid.querySelectorAll(".region-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    regionGrid.querySelectorAll(".region-chip").forEach((b) => b.classList.remove("is-on"));
    btn.classList.add("is-on");
    currentRegion = btn.dataset.region || "";
  });
});
regionGrid.querySelector('[data-region=""]')?.classList.add("is-on");

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
