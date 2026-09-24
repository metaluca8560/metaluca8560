/**
 * 영상에 들어갈 대본. insta-shortform / nyanbot-shorts 스킬이 뽑아주는
 * 훅 → 본문 → CTA 구조를 그대로 옮겨 담으면 된다.
 *
 * Remotion Studio 오른쪽 props 패널에서 값을 바꿔가며 미리보기할 수도 있고,
 * CLI라면 --props='{"hook":"..."}' 로 덮어쓸 수 있다.
 */
export type Beat = {
  /** 화면 상단 작은 라벨 (예: "① 문제") */
  label: string;
  /** 큰 글씨 한 줄 */
  title: string;
  /** 아래 보조 설명 (선택) */
  body?: string;
};

export type ShortFormProps = {
  hook: string;
  beats: Beat[];
  cta: string;
  handle: string;
  /** 각 장면 길이(초) */
  hookSeconds: number;
  beatSeconds: number;
  ctaSeconds: number;
};

export const defaultProps: ShortFormProps = {
  hook: "AI한테 일 시키는 사람은\n퇴근이 2시간 빠릅니다",
  beats: [
    {
      label: "① 흔한 실수",
      title: "매번 처음부터 설명한다",
      body: "같은 맥락을 매일 다시 입력하니 시간이 녹는다",
    },
    {
      label: "② 바꿀 점",
      title: "반복되는 건 스킬로 굳힌다",
      body: "한 번 정리해두면 다음부터는 한 줄이면 끝",
    },
    {
      label: "③ 결과",
      title: "보고서 작성 40분 → 6분",
      body: "직접 쓰는 대신 검토만 하면 되니까",
    },
  ],
  cta: "자동화 루틴 더 보기",
  handle: "@metaluca2750",
  hookSeconds: 2.5,
  beatSeconds: 3,
  ctaSeconds: 2.5,
};
