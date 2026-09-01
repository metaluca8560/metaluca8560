import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { siteTheme } from "./theme";

/**
 * index.html 히어로 뒤에 깔리는 배경 루프.
 *
 * 이음매를 없애는 방법: 모든 움직임을 원운동으로 만들고, 루프 길이 동안
 * 정수 바퀴만 돌게 한다. 그러면 마지막 프레임 다음이 첫 프레임과 정확히
 * 이어져서 되감기는 티가 안 난다.
 *
 * 글자 뒤에 깔리는 영상이라 대비를 낮게 잡았다. 본문 텍스트(#221e33)의
 * 가독성을 해치지 않는 게 이 영상의 첫 번째 조건이다.
 */

type Blob = {
  color: string;
  /** 화면 대비 크기 (0~1) */
  size: number;
  /** 궤도 중심 (0~1) */
  cx: number;
  cy: number;
  /** 궤도 반지름 (0~1) */
  rx: number;
  ry: number;
  /** 루프 한 번에 도는 바퀴 수 — 정수여야 이음매가 없다 */
  turns: number;
  /** 시작 위상 (0~1) */
  phase: number;
  opacity: number;
  /** 크기가 숨쉬는 주기 — 이것도 정수여야 이음매가 유지된다 */
  breathTurns: number;
};

const blobs: Blob[] = [
  {
    color: siteTheme.purpleSoft,
    size: 0.85,
    cx: 0.5,
    cy: 0.05,
    rx: 0.26,
    ry: 0.13,
    turns: 1,
    phase: 0,
    opacity: 0.44,
    breathTurns: 2,
  },
  {
    color: siteTheme.purple,
    size: 0.6,
    cx: 0.2,
    cy: 0.3,
    rx: 0.2,
    ry: 0.16,
    turns: 1,
    phase: 0.35,
    opacity: 0.22,
    breathTurns: 1,
  },
  {
    color: siteTheme.sky,
    size: 0.62,
    cx: 0.82,
    cy: 0.28,
    rx: 0.22,
    ry: 0.18,
    turns: 1,
    phase: 0.7,
    opacity: 0.18,
    breathTurns: 1,
  },
  // 옐로우는 스카이블루에서 떼어놓는다. 겹치면 초록빛이 돌아 브랜드 색에서 벗어난다.
  {
    color: siteTheme.yellow,
    size: 0.4,
    cx: 0.3,
    cy: 0.72,
    rx: 0.18,
    ry: 0.14,
    turns: 2,
    phase: 0.15,
    opacity: 0.11,
    breathTurns: 3,
  },
];

export const HeroLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = frame / durationInFrames; // 0 → 1

  return (
    <AbsoluteFill style={{ backgroundColor: siteTheme.bg }}>
      {blobs.map((blob, i) => {
        const angle = (t * blob.turns + blob.phase) * Math.PI * 2;
        const x = (blob.cx + Math.cos(angle) * blob.rx) * width;
        const y = (blob.cy + Math.sin(angle) * blob.ry) * height;
        // 크기를 함께 흔든다. 부드러운 그라디언트는 위치가 움직이는 것보다
        // 크기가 변하는 쪽이 훨씬 잘 보인다.
        const breathe =
          1 + Math.sin((t * blob.breathTurns + blob.phase) * Math.PI * 2) * 0.16;
        const radius = blob.size * width * 0.5 * breathe;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - radius,
              top: y - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 68%)`,
              opacity: blob.opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
