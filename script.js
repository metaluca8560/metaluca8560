// 현재 연도
document.getElementById("year").textContent = new Date().getFullYear();

// 헤더 그림자 + 플로팅 CTA 표시
const header = document.getElementById("siteHeader");
const floatingCta = document.querySelector(".floating-cta");

const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle("scrolled", y > 8);
  // 히어로를 벗어나면 플로팅 버튼 노출 (연락처 근처에서는 숨김)
  const contact = document.getElementById("contact");
  const nearContact = contact.getBoundingClientRect().top < window.innerHeight;
  floatingCta.classList.toggle("show", y > 480 && !nearContact);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 스크롤 등장 애니메이션
const revealTargets = document.querySelectorAll(
  ".problem-item, .inbox-card, .card, .step, .section-title, .contact-title"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("in"));
}

// 무료 진단 폼 (데모: 실제 전송은 백엔드/서비스 연동 필요)
const form = document.getElementById("leadForm");
const note = document.getElementById("formNote");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const contact = form.contact.value.trim();

  if (!name || !contact) {
    note.textContent = "이름과 연락처를 입력해 주세요.";
    note.className = "form-note err";
    return;
  }

  // TODO: 실제 운영 시 이메일/카카오/스프레드시트 등으로 전송하도록 연동하세요.
  note.textContent = "신청이 접수되었습니다. 빠르게 연락드리겠습니다! 🙌";
  note.className = "form-note ok";
  form.reset();
});
