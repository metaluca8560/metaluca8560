import { continueRender, delayRender } from "remotion";

/**
 * Pretendard 로딩.
 *
 * 주소는 index.html이 쓰는 것과 똑같이 맞췄다. 버전 태그(@v1.3.9) 없이
 * 요청하면 jsDelivr가 403을 돌려주고, 그러면 렌더가 조용히 시스템 폰트로
 * 넘어가 버린다. 실제로 그렇게 뽑힌 적이 있다.
 *
 * 개별 woff2를 하나씩 받는 대신 CSS 한 장을 물리는 이유도 같다.
 * 사이트에서 이미 검증된 경로라서다.
 *
 * 네트워크가 막힌 환경에서도 렌더가 멈추지 않도록, 실패하면 시스템 폰트로
 * 조용히 넘어간다.
 */
const CSS =
  "https://fastly.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css";

const WEIGHTS = ["400", "700", "900"];

export const loadPretendard = () => {
  if (typeof document === "undefined") return;

  const handle = delayRender("Pretendard 로딩");
  let settled = false;
  const done = () => {
    if (settled) return;
    settled = true;
    continueRender(handle);
  };

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = CSS;

  link.addEventListener("load", () => {
    // CSS만 받아서는 부족하다. 실제 글자를 그릴 때 쓰는 굵기를 하나씩
    // 불러와야 첫 프레임부터 Pretendard로 그려진다.
    Promise.all(WEIGHTS.map((w) => document.fonts.load(`${w} 16px Pretendard`)))
      .then(() => document.fonts.ready)
      .catch(() => {})
      .finally(done);
  });
  link.addEventListener("error", done);

  document.head.appendChild(link);

  // 이벤트가 끝내 안 오는 경우를 대비한 안전장치
  setTimeout(done, 10000);
};
