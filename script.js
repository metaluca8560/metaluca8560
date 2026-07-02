// METALUCA 포트폴리오 허브
document.getElementById("year").textContent = new Date().getFullYear();

// 스크롤 등장 애니메이션
const targets = document.querySelectorAll(".proj, .stack-card, .section-title, .kicker, .contact-sub");
targets.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
targets.forEach((el) => io.observe(el));
