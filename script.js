// ============================================================
// METALUCA 링크 허브
// ✏️ 여기에 실제 계정 주소만 채우면 됩니다. (비워두면 타일이 흐려짐)
// ============================================================
const LINKS = {
  twitter: "",   // 예: "https://x.com/계정"
  opensea: "",   // 예: "https://opensea.io/계정"
  instagram: "", // 예: "https://instagram.com/계정"
  tiktok: "",    // 예: "https://www.tiktok.com/@계정"
  blog: "",      // 예: "https://blog.naver.com/계정"
  spatial: "",   // 예: "https://www.spatial.io/s/…"
  marpple: "",   // 예: "https://marpple.shop/kr/계정"
  kmong: "",     // 예: "https://kmong.com/gig/…"
};

document.getElementById("year").textContent = new Date().getFullYear();

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
const targets = document.querySelectorAll(".tile, .row, .profile");
targets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
targets.forEach((el) => io.observe(el));
