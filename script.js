// ============================================================
// LUCA 메인 랜딩
// ✏️ LINKS: 실제 계정 주소만 채우면 됩니다. (비워두면 타일이 흐려짐)
// ✏️ STATS: 성과 숫자 — 반드시 "실제 수치"로 채우세요.
//           모두 비워두면 성과 섹션 자체가 표시되지 않습니다.
// ✏️ REELS: 사이트에 걸 인스타그램 릴스. 비워두면 릴스 섹션이 표시되지 않습니다.
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

// 사이트에 걸 인스타그램 릴스.
//   code  — 릴스 주소의 마지막 조각. instagram.com/reel/ABC123xyz/ 라면 "ABC123xyz"
//   title — 카드에 보이는 한 줄 설명
//   date  — 올린 날짜 "2026-08-17". 이것만 적어두면 최신순 정렬은 자동이다.
//           순서를 신경 쓸 필요 없이 아래에 계속 덧붙이기만 하면 된다.
//           비워두면 날짜 없이 맨 뒤로 간다.
//   thumb — (선택) 직접 저장한 썸네일 경로. 없으면 브랜드 그라데이션 카드로 나온다.
//           인스타 CDN 주소를 직접 걸면 만료돼서 깨지므로, 쓸 거면 파일로 받아두세요.
// 카드를 누르기 전까지 인스타그램 쪽 리소스는 하나도 불러오지 않습니다.
const REELS = [
  // title은 비워도 된다. 넣으면 카드 아래쪽에 한 줄로 얹힌다.
  { code: "DcDz9ekSfID", title: "비개발자의 역습", date: "", thumb: "reels/DcDz9ekSfID.jpg" },
  { code: "DcL5RkDyVat", title: "토스 미니앱 16개 출시", date: "", thumb: "reels/DcL5RkDyVat.jpg" },
  { code: "Dcn4YmLyhFG", title: "명함 공모전", date: "", thumb: "reels/Dcn4YmLyhFG.jpg" },
];

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

// 릴스 카드 생성 + 재생창
// 카드는 썸네일(또는 그라데이션)만 보여주는 껍데기다. 실제 인스타그램 임베드는
// 눌렀을 때 iframe으로 처음 불러온다. 그래서 페이지 로딩에 얹히는 비용이 0이다.
(function () {
  const section = document.getElementById("reels");
  const grid = document.getElementById("reelGrid");
  const modal = document.getElementById("reelModal");
  const frame = document.getElementById("reelFrame");
  if (!section || !grid || !modal || !frame) return;

  // 최신순으로 세운다. 날짜를 안 적은 건 순서를 알 수 없으니 뒤로 보내고,
  // 저희끼리는 적어둔 순서를 지킨다.
  const sorted = REELS.map((reel, i) => ({ reel, i })).sort((a, b) => {
    const da = a.reel.date || "";
    const db = b.reel.date || "";
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return a.i - b.i;
  });

  sorted.forEach(({ reel }) => {
    if (!reel || !reel.code) return;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "reel";
    card.dataset.code = reel.code;
    card.setAttribute("aria-label", (reel.title || "릴스") + " 재생");

    // 커버는 대부분 제목이 이미 박혀 있다. 글자 위에 재생 버튼이나 라벨을
    // 덮어씌우면 원본을 가리므로, 썸네일 영역과 제목을 위아래로 분리한다.
    const thumb = document.createElement("span");
    thumb.className = "reel-thumb";

    if (reel.thumb) {
      const img = document.createElement("img");
      img.src = reel.thumb;
      img.alt = "";
      img.loading = "lazy";
      // 썸네일 파일이 없거나 깨지면 그라데이션 카드로 되돌린다
      img.addEventListener("error", () => {
        img.remove();
        thumb.classList.add("no-thumb");
      });
      thumb.appendChild(img);
    } else {
      thumb.classList.add("no-thumb");
    }
    card.appendChild(thumb);

    if (reel.title) {
      const label = document.createElement("span");
      label.className = "reel-title";
      label.textContent = reel.title;
      card.appendChild(label);
    }

    if (reel.date) {
      const when = document.createElement("time");
      when.className = "reel-date";
      when.dateTime = reel.date;
      // "2026-08-17" → "2026. 8. 17."
      const [y, m, d] = reel.date.split("-");
      when.textContent = `${y}. ${Number(m)}. ${Number(d)}.`;
      card.appendChild(when);
    }

    grid.appendChild(card);
  });

  if (!grid.children.length) return;
  grid.dataset.count = grid.children.length;
  section.hidden = false;

  let opener = null;

  const open = (code) => {
    frame.innerHTML = "";
    const iframe = document.createElement("iframe");
    // embed.js 없이 이 주소만으로 재생된다. 서드파티 스크립트를 안 쓰는 이유다.
    iframe.src = "https://www.instagram.com/reel/" + encodeURIComponent(code) + "/embed";
    iframe.title = "인스타그램 릴스";
    iframe.loading = "lazy";
    iframe.allow = "encrypted-media; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "origin";
    frame.appendChild(iframe);

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".reel-close").focus();
  };

  const close = () => {
    modal.hidden = true;
    frame.innerHTML = ""; // 재생을 확실히 멈추려면 iframe을 지우는 게 가장 확실하다
    document.body.style.overflow = "";
    if (opener) opener.focus();
  };

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".reel");
    if (!card) return;
    opener = card;
    open(card.dataset.code);
  });

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();

// 스크롤 등장
const targets = document.querySelectorAll(
  ".hero, .stats, .p-card, .member, .aud-card, .svc, .tile, .row, .reel, .review, .cta"
);
targets.forEach((el) => el.classList.add("reveal"));
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
targets.forEach((el) => io.observe(el));
