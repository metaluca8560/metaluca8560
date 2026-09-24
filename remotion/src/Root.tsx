import React from "react";
import { Composition } from "remotion";
import { defaultProps } from "./content";
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
    </>
  );
};
