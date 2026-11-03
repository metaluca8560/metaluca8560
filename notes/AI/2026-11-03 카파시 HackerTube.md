---
title: 카파시 HackerTube
created: 2026-11-03
date: 2026-10-31
type: 사례
person: "[[안드레이 카파시]]"
tags:
  - AI/사례
  - Claude
  - 데이터분석
  - 추천시스템
source: https://www.businesstoday.in/amp/technology/news/story/tired-of-youtube-recommendations-andrej-karpathy-builds-hackertube-with-6454-videos-to-explore-565171-2026-11-02
status: 팩트체크 완료
---

# 카파시 HackerTube

> [!summary] 한 줄 요약
> [[안드레이 카파시]]가 Hacker News 댓글에서 추천된 유튜브 영상만 모아 보여주는 사이트 **HackerTube**를 Claude로 약 2시간 만에 만들어 공개했다. (2026-10-31)

## 확인된 사실

| 항목 | 내용 |
|---|---|
| 공개일 | 2026년 10월 31일 |
| 사이트 | hackertube.org |
| 대상 기간 | 2007 ~ 2026년 Hacker News 댓글 |
| 훑어본 댓글 | 약 **4,300만 개** (카파시 본인 수치) |
| 추려낸 추천 댓글 | **39,834개** (약 4만 개) |
| 최종 영상 수 | **6,454개**, 150개 주제로 분류 |
| 사용 도구 | Claude Code (Opus 5.5) + Claude Sonnet 워크플로 |
| 제작 시간 | 약 2시간 (보도 기준) |

## 어떻게 만들었나
1. **수집·1차 필터** — Claude Opus 5.5가 HN 댓글을 내려받아 걸러냄
2. **라벨링** — Claude Code 워크플로 안에서 Claude Sonnet이 스팸을 거르고 "유튜브 영상을 추천하는 댓글"을 판별
   - Sonnet 라벨링 호출이 전체 사용량의 90% 이상
3. **사이트 제작** — 영상 6,454개를 150개 주제로 묶어 유튜브 스타일 사이트로 구성

## 특징
- 썸네일은 제작자가 올린 이미지가 아니라 **영상 중간 지점 프레임**을 캡처해 사용
- 계정 없이 **브라우저 로컬 세션**에 상태를 저장해 맞춤 추천 제공
- 데이터를 **내보내기(공개)** 해서 누구나 자기 버전을 만들 수 있음

## 만든 이유
- 유튜브 추천 알고리즘에 대한 불만
- 홈 화면을 "enshittified wall of slop"이라고 표현, 알고리즘이 평균 사용자에겐 맞을지 몰라도 자신에겐 맞지 않는다고 밝힘

## ⚠️ 주의할 점
- 4,300만 / 39,834 / 6,454 수치는 **제작자 공개 수치**이며 독립 검증된 것은 아님
- 일부 매체는 약 4만 개로 반올림해 표기 → 4,300만 개(전체 풀)와 혼동 주의
- HN 전체를 조사한 통계가 아니라 **선별된 목록**
- "사람들이 **반복적으로** 추천한 영상"이라는 표현은 근거 확인 안 됨 → "댓글에서 추천된 영상"이 정확

## 인사이트
- 새로 만드는 것보다 **이미 쌓인 데이터(20년치 커뮤니티 집단지성)를 분석해 쓸모 있는 결과물로 바꾼 사례**
- 대규모 분류는 저렴한 모델(Sonnet)에, 설계·구현은 상위 모델(Opus)에 맡기는 **역할 분담 구조**

## 관련
- [[안드레이 카파시]]
- [[Claude Code]]
- [[AI 업무자동화 사례]]

## 출처
- [BusinessToday – Andrej Karpathy builds HackerTube with 6,454 videos](https://www.businesstoday.in/amp/technology/news/story/tired-of-youtube-recommendations-andrej-karpathy-builds-hackertube-with-6454-videos-to-explore-565171-2026-11-02)
- [FourWeekMBA – Karpathy Has Claude Build HackerTube From 6,454 HN Videos](https://fourweekmba.com/ai-karpathy-has-claude-build-hackertube-from-6454-hn-videos/)
- [AI Weekly – Karpathy ships HackerTube in ~2 hours with Claude Opus 5.5](https://aiweekly.co/alerts/karpathy-ships-hackertube-in-2-hours-with-claude-opus-55)
- [Crypto Briefing – Karpathy launches HackerTube](https://cryptobriefing.com/andrej-karpathy-launches-hackertube/)
- [Min Choi on X – HackerTube 데이터 공개](https://x.com/minchoi/status/2117254180704223637)
