import { continueRender, delayRender } from "remotion";

/**
 * Pretendard를 CDN에서 불러온다. 네트워크가 막힌 환경에서도 렌더가 멈추지 않도록
 * 실패하면 시스템 폰트로 조용히 폴백한다.
 */
const CDN = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/woff2";

const weights: [string, string][] = [
  ["400", `${CDN}/Pretendard-Regular.woff2`],
  ["700", `${CDN}/Pretendard-Bold.woff2`],
  ["900", `${CDN}/Pretendard-Black.woff2`],
];

export const loadPretendard = () => {
  if (typeof document === "undefined") return;

  const handle = delayRender("Pretendard 로딩");

  Promise.all(
    weights.map(async ([weight, url]) => {
      const face = new FontFace("Pretendard", `url(${url})`, { weight });
      await face.load();
      document.fonts.add(face);
    }),
  )
    .catch(() => {
      // 폰트를 못 받아도 렌더는 계속 — 폴백 스택으로 그려진다.
    })
    .finally(() => continueRender(handle));
};
