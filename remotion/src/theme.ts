/**
 * 브랜드 팔레트 — 루트 styles.css의 :root 변수와 같은 색을 쓴다.
 * 릴스는 대부분 어두운 화면에서 보므로 배경만 딥 톤으로 뒤집었다.
 */
export const theme = {
  bg: "#17132a",
  bgDeep: "#0d0a1a",
  text: "#ffffff",
  muted: "#b3aacb",
  purple: "#7c3aed",
  purpleSoft: "#a78bfa",
  sky: "#0ea5e9",
  yellow: "#f5b91b",
  font: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
} as const;
