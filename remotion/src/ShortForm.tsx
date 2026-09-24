import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Beat, ShortFormProps } from "./content";
import { loadPretendard } from "./fonts";
import { theme } from "./theme";

loadPretendard();

/** 화면 전체를 덮는 배경 — 아주 느리게 도는 그라디언트 두 덩어리 */
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bgDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 40% at ${20 + drift * 25}% ${
            12 + drift * 10
          }%, ${theme.purple}66, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(55% 38% at ${85 - drift * 25}% ${
            80 - drift * 12
          }%, ${theme.sky}44, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** 상단 진행 바 — 시청자가 "얼마 안 남았네" 하고 끝까지 보게 만드는 장치 */
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / (durationInFrames - 1);

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        left: 72,
        right: 72,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#ffffff22",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${theme.purpleSoft}, ${theme.yellow})`,
        }}
      />
    </div>
  );
};

/** 아래에서 살짝 떠오르며 나타나는 래퍼. delay는 프레임 단위. */
const Rise: React.FC<{ delay?: number; children: React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};

const HookScene: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: "0 90px",
      textAlign: "center",
    }}
  >
    <Rise>
      <div
        style={{
          fontSize: 96,
          fontWeight: 900,
          lineHeight: 1.28,
          color: theme.text,
          whiteSpace: "pre-line",
          wordBreak: "keep-all",
          textShadow: "0 12px 40px rgba(0,0,0,.45)",
        }}
      >
        {text}
      </div>
    </Rise>
    <Rise delay={10}>
      <div
        style={{
          marginTop: 44,
          width: 120,
          height: 8,
          borderRadius: 999,
          backgroundColor: theme.yellow,
        }}
      />
    </Rise>
  </AbsoluteFill>
);

const BeatScene: React.FC<{ beat: Beat }> = ({ beat }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      padding: "0 90px",
    }}
  >
    <Rise>
      <div
        style={{
          display: "inline-block",
          padding: "14px 30px",
          borderRadius: 999,
          backgroundColor: `${theme.purple}55`,
          border: `2px solid ${theme.purpleSoft}`,
          color: theme.purpleSoft,
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {beat.label}
      </div>
    </Rise>
    <Rise delay={6}>
      <div
        style={{
          marginTop: 40,
          fontSize: 82,
          fontWeight: 900,
          lineHeight: 1.3,
          color: theme.text,
          wordBreak: "keep-all",
        }}
      >
        {beat.title}
      </div>
    </Rise>
    {beat.body ? (
      <Rise delay={14}>
        <div
          style={{
            marginTop: 32,
            fontSize: 46,
            fontWeight: 400,
            lineHeight: 1.55,
            color: theme.muted,
            wordBreak: "keep-all",
          }}
        >
          {beat.body}
        </div>
      </Rise>
    ) : null}
  </AbsoluteFill>
);

const CtaScene: React.FC<{ cta: string; handle: string }> = ({ cta, handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 마지막에 한 번 통통 튀게 — 저장/팔로우 버튼으로 눈이 가도록
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 90px",
        textAlign: "center",
      }}
    >
      <div style={{ transform: `scale(${interpolate(pop, [0, 1], [0.82, 1])})` }}>
        <div
          style={{
            padding: "34px 62px",
            borderRadius: 32,
            background: `linear-gradient(115deg, ${theme.purple}, ${theme.purpleSoft})`,
            fontSize: 66,
            fontWeight: 900,
            color: theme.text,
            boxShadow: "0 24px 60px rgba(124,58,237,.45)",
          }}
        >
          {cta}
        </div>
      </div>
      <Rise delay={12}>
        <div
          style={{
            marginTop: 46,
            fontSize: 44,
            fontWeight: 700,
            color: theme.yellow,
            letterSpacing: 1,
          }}
        >
          {handle}
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

export const ShortForm: React.FC<ShortFormProps> = ({
  hook,
  beats,
  cta,
  handle,
  hookSeconds,
  beatSeconds,
  ctaSeconds,
}) => {
  const { fps } = useVideoConfig();
  const hookFrames = Math.round(hookSeconds * fps);
  const beatFrames = Math.round(beatSeconds * fps);
  const ctaFrames = Math.round(ctaSeconds * fps);

  return (
    <AbsoluteFill style={{ fontFamily: theme.font, backgroundColor: theme.bg }}>
      <Backdrop />
      <ProgressBar />

      <Sequence durationInFrames={hookFrames}>
        <HookScene text={hook} />
      </Sequence>

      {beats.map((beat, i) => (
        <Sequence
          key={beat.label + i}
          from={hookFrames + i * beatFrames}
          durationInFrames={beatFrames}
        >
          <BeatScene beat={beat} />
        </Sequence>
      ))}

      <Sequence
        from={hookFrames + beats.length * beatFrames}
        durationInFrames={ctaFrames}
      >
        <CtaScene cta={cta} handle={handle} />
      </Sequence>
    </AbsoluteFill>
  );
};

/** 대본 길이에 맞춰 전체 영상 길이를 자동 계산한다. */
export const calculateShortFormMetadata = ({
  props,
}: {
  props: ShortFormProps;
}) => {
  const fps = 30;
  const seconds =
    props.hookSeconds + props.beats.length * props.beatSeconds + props.ctaSeconds;

  return { fps, durationInFrames: Math.round(seconds * fps) };
};
