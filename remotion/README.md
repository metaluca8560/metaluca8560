# Remotion — 숏폼 영상 렌더링

React로 릴스·쇼츠·틱톡 영상을 만들어 mp4로 뽑는 작업 폴더입니다.
사이트 본체(정적 HTML)와 완전히 분리돼 있어서 Netlify 배포에는 아무 영향이 없습니다.

## 설치

```bash
cd remotion
npm install
```

## 미리보기 (Remotion Studio)

```bash
npm run studio
# http://localhost:3000 이 열린다
```

왼쪽에서 컴포지션을 고르고, 오른쪽 props 패널에서 훅·본문·CTA 문구를
바꿔가며 바로 확인할 수 있습니다. 타임라인을 드래그하면 프레임 단위로 볼 수 있습니다.

## 렌더

```bash
npm run render          # 1080×1920 세로 (릴스/쇼츠/틱톡) → out/shortform.mp4
npm run render:square   # 1080×1080 정사각 (인스타 피드) → out/shortform-square.mp4
npm run thumbnail       # 썸네일 한 장 → out/thumbnail.png
```

대본만 갈아끼워서 뽑고 싶을 때는 props를 CLI로 덮어씁니다.

```bash
npx remotion render ShortForm out/이번주.mp4 --props='{
  "hook": "이번 훅 문구",
  "beats": [{ "label": "① 문제", "title": "큰 글씨 한 줄", "body": "보조 설명" }],
  "cta": "프로필 링크 확인",
  "handle": "@metaluca",
  "hookSeconds": 2.5, "beatSeconds": 3, "ctaSeconds": 2.5
}'
```

영상 길이는 `beats` 개수에 맞춰 자동으로 계산됩니다(`calculateShortFormMetadata`).

## 구조

| 파일 | 역할 |
|------|------|
| `src/index.ts` | 진입점 (`registerRoot`) |
| `src/Root.tsx` | 컴포지션 등록 — `ShortForm`(9:16), `ShortFormSquare`(1:1) |
| `src/ShortForm.tsx` | 실제 화면. 훅 → 본문 비트 → CTA 순서로 장면이 이어진다 |
| `src/content.ts` | 기본 대본과 props 타입. **평소엔 여기만 고치면 된다** |
| `src/theme.ts` | 색·폰트. 루트 `styles.css`의 브랜드 컬러와 같은 값 |
| `src/fonts.ts` | Pretendard를 CDN에서 로드 (실패하면 시스템 폰트로 폴백) |

`insta-shortform` / `nyanbot-shorts` 스킬이 뽑아주는 훅–본문–CTA 기획안을
`content.ts`의 `defaultProps`에 그대로 옮겨 담으면 바로 영상이 됩니다.

## 크롬을 못 받는 환경일 때

Remotion은 첫 렌더에서 Chrome Headless Shell을 자동으로 내려받습니다.
egress가 막혀 403이 나면, 이미 깔린 headless shell 경로를 지정하세요.

```bash
export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npm run render
```

일반 Chrome/Chromium 바이너리는 구 headless 모드가 제거돼서 동작하지 않습니다.
반드시 `headless_shell` 쪽을 가리켜야 합니다.
