// ============================================================
// METALUCA 링크 허브
// ✏️ 여기에 실제 계정 주소만 채우면 됩니다. (비워두면 타일이 흐려짐)
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
  kmong: "", // E-book 주소 생기면 여기에
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
