// ===== 캔바 × AI 클래스 — 인터랙션 =====

// 올해 연도
document.getElementById("year").textContent = new Date().getFullYear();

// 스크롤 시 내비 그림자
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// FAQ: 한 번에 하나만 열리도록 (선택 사항)
const faqs = document.querySelectorAll(".faq details");
faqs.forEach((d) => {
  d.addEventListener("toggle", () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  });
});

// 수강 신청 폼 (데모)
const form = document.getElementById("applyForm");
const note = document.getElementById("formNote");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.name.value.trim() || !form.contact.value.trim()) {
    note.hidden = false;
    note.style.color = "#fca5a5";
    note.textContent = "이름과 연락처를 입력해 주세요.";
    return;
  }
  // TODO: 실제 신청 접수 연동
  //  - 가장 쉬움: Formspree(formspree.io)에서 폼 생성 후
  //    <form> 태그에 action="https://formspree.io/f/XXXX" method="post" 추가
  //  - 또는 구글 폼 / Google Apps Script(스프레드시트 기록) / 카카오 채널 연동
  note.hidden = false;
  note.style.color = "#a7f3d0";
  note.textContent = "신청이 접수되었습니다! 개강 안내를 보내드릴게요. (데모 모드)";
  form.reset();
});
