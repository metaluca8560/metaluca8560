// ===== ATELIER 포트폴리오 — 인터랙션 =====

// 올해 연도
document.getElementById("year").textContent = new Date().getFullYear();

// 스크롤 시 내비 테두리
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// 작품 분류 필터
const filters = document.querySelectorAll(".filter");
const works = document.querySelectorAll(".work");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const cat = btn.dataset.filter;
    works.forEach((w) => {
      const show = cat === "all" || w.dataset.cat === cat;
      w.classList.toggle("is-hidden", !show);
    });
  });
});

// 문의 폼 (데모) — 실제 전송은 아래 TODO 참고
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!form.name.value.trim() || !form.contact.value.trim()) {
    note.hidden = false;
    note.textContent = "이름과 연락처를 입력해 주세요.";
    return;
  }
  // TODO: 실제 전송 연동
  //  - 가장 쉬움: Formspree(formspree.io)에서 폼 생성 후
  //    form 태그에 action="https://formspree.io/f/XXXX" method="post" 추가
  //  - 또는 mailto / 카카오 채널 / Google Apps Script 연동
  note.hidden = false;
  note.textContent = "문의가 접수되었습니다. 곧 회신드리겠습니다. (데모 모드)";
  form.reset();
});
