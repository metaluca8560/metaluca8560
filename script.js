// 현재 연도
document.getElementById("year").textContent = new Date().getFullYear();

// 네비 그림자 + 플로팅 CTA
const nav = document.getElementById("nav");
const floatingCta = document.querySelector(".floating-cta");
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 8);
  const contact = document.getElementById("contact");
  const nearContact = contact.getBoundingClientRect().top < window.innerHeight;
  floatingCta.classList.toggle("show", y > 520 && !nearContact);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// 히어로 자동화 흐름 칩 순차 강조
const chips = Array.from(document.querySelectorAll(".flow-chip"));
if (chips.length) {
  let i = 0;
  setInterval(() => {
    chips.forEach((c) => c.classList.remove("active"));
    chips[i].classList.add("active");
    i = (i + 1) % chips.length;
  }, 1100);
}

// 스크롤 등장 애니메이션
const targets = document.querySelectorAll(
  ".section-title, .kicker, .metric, .pain-item, .tile, .compare-panel, .proof-quote, .stepper li, .accordion details, .cta-copy, .cta-form"
);
targets.forEach((el) => el.classList.add("reveal"));
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
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add("in"));
}

// FAQ: 한 번에 하나만 열기
const items = document.querySelectorAll(".accordion details");
items.forEach((d) => {
  d.addEventListener("toggle", () => {
    if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
  });
});

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
