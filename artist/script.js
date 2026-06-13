// ===== ATELIER — 에디토리얼 포트폴리오 인터랙션 =====

// 올해 연도
document.getElementById("year").textContent = new Date().getFullYear();

// ----- 커스텀 커서 (마우스 환경에서만) -----
const cursor = document.getElementById("cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (finePointer && cursor) {
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;

  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });

  // 부드러운 추적(lag)
  const render = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };
  render();

  // data-cursor 요소 위에서 확대 + 라벨
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
}

// ----- 스크롤 등장 (IntersectionObserver) -----
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".work, .about-cols, .index-block").forEach((el) => io.observe(el));

// ----- 문의 폼 (데모) -----
const form = document.getElementById("contactForm");
const note = document.getElementById("formNote");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.name.value.trim() || !form.contact.value.trim()) {
      note.hidden = false;
      note.textContent = "이름과 연락처를 입력해 주세요.";
      return;
    }
    // TODO: 실제 전송 연동
    //  - 가장 쉬움: Formspree(formspree.io)에서 폼 생성 후
    //    <form>에 action="https://formspree.io/f/XXXX" method="post" 추가
    //  - 또는 mailto / 카카오 채널 / Google Apps Script 연동
    note.hidden = false;
    note.textContent = "문의가 접수되었습니다. 곧 회신드리겠습니다. (데모 모드)";
    form.reset();
  });
}
