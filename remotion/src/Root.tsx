import React from "react";
import { Composition } from "remotion";
import { defaultProps } from "./content";
import { HeroLoop } from "./HeroLoop";
import { calculateShortFormMetadata, ShortForm } from "./ShortForm";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 릴스 · 쇼츠 · 틱톡 */}
      <Composition
        id="ShortForm"
        component={ShortForm}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={330}
        defaultProps={defaultProps}
        calculateMetadata={calculateShortFormMetadata}
      />
      {/* 인스타 피드용 정사각 버전 — 대본은 그대로 재사용 */}
      <Composition
        id="ShortFormSquare"
        component={ShortForm}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={330}
        defaultProps={defaultProps}
        calculateMetadata={calculateShortFormMetadata}
      />
      {/*
        index.html 히어로 뒤에 깔리는 배경 루프 — 10초, 이음매 없음.
        움직임이 아주 느려서 15fps로도 육안 차이가 없다. 프레임 수를 절반으로
        줄이면 파일도 그만큼 가벼워진다.
      */}
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        width={1920}
        height={1080}
        fps={15}
        durationInFrames={150}
      />
    </>
  );
};
