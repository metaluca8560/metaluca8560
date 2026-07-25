// ============================================================
// LUCA 메인 랜딩
// ✏️ LINKS: 실제 계정 주소만 채우면 됩니다. (비워두면 타일이 흐려짐)
// ✏️ STATS: 성과 숫자 — 반드시 "실제 수치"로 채우세요.
//           모두 비워두면 성과 섹션 자체가 표시되지 않습니다.
// ============================================================
const LINKS = {
  twitter: "https://x.com/metaluca8560",
  opensea: "https://opensea.io/metaluca_2750",
  instagram: "https://www.instagram.com/metaluca2750",
  tiktok: "https://www.tiktok.com/@metaluca2750",
  blog: "https://naver.me/FLEwyESn",
  youtube: "https://youtube.com/@metaluca8563?si=C_WhYZQBKxnsDU8g",
  spatial: "https://www.spatial.io/s/metarukas-Healing-space-627e1fa4bf651d0001da7543?share=5565475882378913124",
  marpple: "https://marpple.shop/kr/metaluca_2750/",
  github: "https://github.com/metaluca8560",
  kmong: "", // E-book 주소 생기면 여기에
};

// 성과 수치 — 예: lectures: "120회+", students: "3,000+", projects: "50+", contents: "500+"
// ⚠️ 지어낸 숫자를 올리면 신뢰를 잃습니다. 실제 누적 수치를 확인 후 입력하세요.
const STATS = {
  lectures: "",
  students: "",
  projects: "",
  contents: "",
};

document.getElementById("year").textContent = new Date().getFullYear();

// 성과 숫자 주입 (하나라도 값이 있으면 섹션 표시, 빈 항목은 숨김)
(function () {
  const section = document.getElementById("stats");
  if (!section) return;
  let any = false;
  section.querySelectorAll("[data-stat]").forEach((el) => {
    const v = STATS[el.dataset.stat];
    if (v) { el.textContent = v; any = true; }
    else { el.parentElement.style.display = "none"; }
  });
  if (any) section.hidden = false;
})();

// 링크 주입 (미설정 시 흐림 처리 + 클릭 안내)
document.querySelectorAll("[data-link]").forEach((el) => {
  const url = LINKS[el.dataset.link];
  if (url) {
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener";
  } else {
    el.classList.add("is-empty");
    el.addEventListener("click", (e) => {
      e.preventDefault();
      el.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }],
        { duration: 250 }
      );
    });
  }
});

// 스크롤 등장
const targets = document.querySelectorAll(
  ".hero, .stats, .p-card, .member, .aud-card, .svc, .tile, .row, .review, .cta"
);
targets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
targets.forEach((el) => io.observe(el));
