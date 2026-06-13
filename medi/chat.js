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

if (!hasBackend) {
  // 백엔드 미설정: 입력 잠그고 안내
  bubble("bot", "AI 문진은 백엔드(무료 Cloudflare Worker)를 연결하면 켜져요. 설정 전에도 위의 ‘증상 문진’과 ‘응급처치’, ‘병원 찾기’는 모두 사용할 수 있어요.");
  chatNote.hidden = false;
  chatNote.innerHTML = "설정 방법: <code>medi/server/README.md</code> 참고 → 배포 후 <code>config.js</code>의 <code>MEDI_API_BASE</code>에 주소를 넣으면 됩니다.";
  chatInput.disabled = true;
  chatForm.querySelector(".chat-send").disabled = true;
} else {
  bubble("bot", "어디가 어떻게 불편하세요? 부위·언제부터·정도·동반 증상을 적어주시면 도와드릴게요. (진단이 아닌 참고용 안내예요. 위급하면 119)");
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
      body: JSON.stringify({ messages: history }),
    });
    if (!res.ok) throw new Error("server " + res.status);
    const data = await res.json();
    const reply = (data.reply || "").trim() || "다시 한 번 말씀해 주시겠어요?";
    thinking.textContent = reply;
    history.push({ role: "assistant", content: reply });
  } catch (err) {
    thinking.textContent = "연결에 문제가 생겼어요. 잠시 후 다시 시도하거나, 위급하면 119에 연락하세요.";
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
});

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
