/* ================================================================
   오늘 어디 아파? — 2단계: AI 문진 + 실시간 병원 목록
   백엔드(Cloudflare Worker, server/ 참고)가 있으면 동작하고,
   없으면( config.js의 MEDI_API_BASE가 "" ) 안내로 폴백합니다.
   ================================================================ */

const API_BASE = (window.MEDI_API_BASE || "").replace(/\/$/, "");
const hasBackend = API_BASE.length > 0;

// ---------- AI 문진 채팅 ----------
const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatNote = document.getElementById("chatNote");

// 대화 기록 (백엔드로 전송)
const history = [];

function bubble(role, text) {
  const el = document.createElement("div");
  el.className = "msg msg-" + role;
  el.textContent = text;
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
  return el;
}

// 모드별 첫인사
const OPENERS = {
  senior: "안녕하세요. 어디가 불편하신지 편하게 말씀해 주세요. 천천히 하나씩 여쭤보며 도와드릴게요.",
  adult: "안녕하세요. 어디가 어떻게 불편하세요? 편하게 적어주시면 하나씩 여쭤보며 안내해 드릴게요.",
  child: "안녕하세요. 아이가 어디가 불편한가요? 증상을 적어주시면 하나씩 여쭤보며 도와드릴게요.",
};

if (!hasBackend) {
  // 백엔드 미설정: 입력 잠그고 안내
  bubble("bot", "AI 문진은 백엔드(무료 Cloudflare Worker)를 연결하면 켜져요. 설정 전에도 위의 ‘증상 문진’과 ‘응급처치’, ‘병원 찾기’는 모두 사용할 수 있어요.");
  chatNote.hidden = false;
  chatNote.innerHTML = "설정 방법: <code>medi/server/README.md</code> 참고 → 배포 후 <code>config.js</code>의 <code>MEDI_API_BASE</code>에 주소를 넣으면 됩니다.";
  chatInput.disabled = true;
  chatForm.querySelector(".chat-send").disabled = true;
} else {
  bubble("bot", OPENERS[document.body.className] || OPENERS.adult);
  bubble("bot", "참고용 안내예요. 위급하면 바로 119에 연락하세요.");
  // 시작 예시 칩
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
    const res = await fetch(API_BASE + "/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, mode: document.body.className }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    const reply = (data.reply || "").trim() || "다시 한 번 말씀해 주시겠어요?";
    renderBotReply(thinking, reply);
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    thinking.textContent = "연결에 문제가 생겼어요. 잠시 후 다시 시도하거나, 위급하면 119에 연락하세요.";
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

// ---------- 봇 답변 렌더 (카드 포함) ----------
const URGENCY = {
  green: { cls: "u-green", badge: "🟢", label: "급하지 않아 보여요 · 평소 진료" },
  yellow: { cls: "u-yellow", badge: "⏱️", label: "오늘 중 진료를 권해요" },
  red: { cls: "u-red", badge: "🚑", label: "지금 바로 진료가 필요해요" },
};

function renderBotReply(thinkingEl, reply) {
  const m = reply.match(/<card>([\s\S]*?)<\/card>/);
  let card = null;
  if (m) {
    try { card = JSON.parse(m[1].trim()); } catch (e) { card = null; }
  }
  const text = reply.replace(/<card>[\s\S]*?<\/card>/, "").trim();

  if (card) {
    const cardEl = buildChatCard(card);
    chatBox.insertBefore(cardEl, thinkingEl); // 카드 먼저
  }
  if (text) {
    thinkingEl.textContent = text;
  } else {
    thinkingEl.remove(); // 카드만 있고 부가 텍스트 없으면 빈 말풍선 제거
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

function buildChatCard(data) {
  const u = URGENCY[data.urgency] || URGENCY.yellow;
  const depts = Array.isArray(data.departments) ? data.departments : [];
  const home = Array.isArray(data.home) ? data.home : [];
  const el = document.createElement("div");
  el.className = "chat-card";
  el.innerHTML = `
    <div class="cc-urgency ${u.cls}">
      <span class="cc-badge">${u.badge}</span>
      <span class="cc-label">${u.label}</span>
    </div>
    ${depts.length ? `<div class="cc-block">
      <span class="cc-h">🏥 권하는 진료과</span>
      <div class="cc-chips">${depts.map((d) => `<span>${escapeHtml(d)}</span>`).join("")}</div>
    </div>` : ""}
    ${home.length ? `<div class="cc-block">
      <span class="cc-h">🏠 집에서 이렇게</span>
      <ul>${home.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
    </div>` : ""}
    <a class="cc-find" href="#finder">📍 주변 병원·약국 찾기</a>`;
  return el;
}

// ---------- 실시간 병원 목록 ----------
const liveBtn = document.getElementById("liveBtn");
const liveList = document.getElementById("liveList");

liveBtn?.addEventListener("click", () => {
  if (!hasBackend) {
    liveList.innerHTML = `<p class="live-empty">실시간 목록은 백엔드 연결 시 표시돼요. 지금은 위의 <strong>📍 가까운 병원/약국/응급실</strong> 버튼으로 지도 검색을 이용하세요.<br><span class="muted">(설정: server/README.md)</span></p>`;
    return;
  }
  liveList.innerHTML = `<p class="live-empty">위치 확인 중…</p>`;
  if (!navigator.geolocation) {
    liveList.innerHTML = `<p class="live-empty">이 기기에서 위치를 쓸 수 없어요. 지도 검색을 이용하세요.</p>`;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchHospitals(pos.coords.latitude, pos.coords.longitude),
    () => { liveList.innerHTML = `<p class="live-empty">위치 권한이 없어요. 허용 후 다시 눌러주세요.</p>`; },
    { timeout: 8000 }
  );
});

async function fetchHospitals(lat, lng) {
  liveList.innerHTML = `<p class="live-empty">가까운 병원을 불러오는 중…</p>`;
  const mode = document.body.className; // senior/adult/child
  const type = mode === "child" ? "소아" : "응급실";
  try {
    const url = `${API_BASE}/hospitals?lat=${lat}&lng=${lng}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    const items = data.items || [];
    if (!items.length) {
      liveList.innerHTML = `<p class="live-empty">주변 결과를 찾지 못했어요. 지도 검색을 이용하거나 119에 문의하세요.</p>`;
      return;
    }
    liveList.innerHTML = items.map((h) => `
      <div class="live-item">
        <div class="li-main">
          <strong>${escapeHtml(h.name || "병원")}</strong>
          ${h.distance ? `<span class="li-dist">${escapeHtml(h.distance)}</span>` : ""}
        </div>
        ${h.address ? `<p class="li-addr">${escapeHtml(h.address)}</p>` : ""}
        <div class="li-actions">
          ${h.tel ? `<a class="li-call" href="tel:${escapeHtml(h.tel)}">📞 ${escapeHtml(h.tel)}</a>` : ""}
          <a class="li-map" href="https://www.google.com/maps/search/${encodeURIComponent(h.name || "병원")}/@${lat},${lng},15z" target="_blank" rel="noopener">🗺 지도</a>
        </div>
      </div>`).join("");
  } catch (err) {
    liveList.innerHTML = `<p class="live-empty">목록을 불러오지 못했어요. 지도 검색을 이용하거나, 위급하면 119에 연락하세요.</p>`;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
