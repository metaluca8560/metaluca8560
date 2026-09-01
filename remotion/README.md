# Remotion — 숏폼 영상 렌더링

React로 릴스·쇼츠·틱톡 영상을 만들어 mp4로 뽑는 작업 폴더입니다.
사이트 본체(정적 HTML)와 완전히 분리돼 있어서 Netlify 배포에는 아무 영향이 없습니다.

## 설치

Node.js LTS(20 이상)가 필요합니다. 윈도우면 [nodejs.org](https://nodejs.org)에서
LTS 설치본을 받으면 됩니다.

```bash
cd remotion
npm install
```

첫 렌더 때 Chrome Headless Shell(약 130MB)을 자동으로 내려받습니다.
윈도우 방화벽 창이 뜨면 허용해 주세요.

## 미리보기 (Remotion Studio)

```bash
npm run studio
# http://localhost:3000 이 열린다
```

왼쪽에서 컴포지션을 고르고, 오른쪽 props 패널에서 훅·본문·CTA 문구를
바꿔가며 바로 확인할 수 있습니다. 타임라인을 드래그하면 프레임 단위로 볼 수 있습니다.

문구를 다듬는 작업은 대부분 여기서 끝납니다. 마음에 드는 상태가 되면 렌더하세요.

## 렌더

```bash
npm run render          # 1080×1920 세로 (릴스/쇼츠/틱톡) → out/shortform.mp4
npm run render:square   # 1080×1080 정사각 (인스타 피드) → out/shortform-square.mp4
npm run thumbnail       # 썸네일 한 장 → out/thumbnail.png
```

## 대본 갈아끼우기

두 가지 방법이 있습니다.

**1) 소스를 고친다** — 기본 대본을 아예 바꾸고 싶을 때.
`src/content.ts`의 `defaultProps`를 수정하면 됩니다.

**2) JSON 파일로 넘긴다** — 소스는 그대로 두고 편별로 다른 대본을 뽑을 때.

```bash
# props.example.json을 복사해서 내용만 고친다
copy props.example.json props.json     # 윈도우 (PowerShell/cmd)
cp props.example.json props.json       # macOS/리눅스

npm run render:props
```

다른 파일명을 쓰거나 출력 경로를 바꾸려면 직접 호출하세요.

```bash
npx remotion render ShortForm out/10월2주차.mp4 --props=10월2주차.json
```

> **윈도우에서는 `--props='{...}'` 처럼 JSON을 명령줄에 직접 넣지 마세요.**
> PowerShell과 cmd의 따옴표 처리 방식이 달라서 JSON이 깨집니다.
> 위처럼 **파일 경로**를 넘기면 셸 종류와 무관하게 동작합니다.

영상 길이는 `beats` 개수에 맞춰 자동으로 계산됩니다(`calculateShortFormMetadata`).
비트를 늘리면 영상도 그만큼 길어집니다.

## 구조

| 파일 | 역할 |
|------|------|
| `src/index.ts` | 진입점 (`registerRoot`) |
| `src/Root.tsx` | 컴포지션 등록 — `ShortForm`(9:16), `ShortFormSquare`(1:1) |
| `src/ShortForm.tsx` | 실제 화면. 훅 → 본문 비트 → CTA 순서로 장면이 이어진다 |
| `src/content.ts` | 기본 대본과 props 타입. **평소엔 여기만 고치면 된다** |
| `src/theme.ts` | 색·폰트. 루트 `styles.css`의 브랜드 컬러와 같은 값 |
| `src/fonts.ts` | Pretendard를 CDN에서 로드 (실패하면 시스템 폰트로 폴백) |
| `props.example.json` | 대본 JSON 예시. 복사해서 쓰면 된다 |

`insta-shortform` / `nyanbot-shorts` 스킬이 뽑아주는 훅–본문–CTA 기획안을
`content.ts`의 `defaultProps`나 `props.json`에 그대로 옮겨 담으면 바로 영상이 됩니다.

## 렌더가 느리거나 뻗을 때

Remotion은 CPU 코어를 최대한 쓰기 때문에, 사양이 낮은 PC에서는 메모리가 모자라
중간에 죽을 수 있습니다. 동시 실행 수를 낮추면 느려지는 대신 안정적으로 끝납니다.

```bash
npx remotion render ShortForm out/shortform.mp4 --concurrency=2
```

## 크롬을 못 받는 환경일 때

> 윈도우·macOS 일반 환경에서는 해당 없습니다. 자동으로 받아옵니다.

사내망이나 CI 컨테이너처럼 egress가 막혀 다운로드가 403으로 실패하면,
이미 깔려 있는 headless shell 경로를 환경변수로 지정하세요.

```bash
export REMOTION_BROWSER_EXECUTABLE=/경로/chrome-linux/headless_shell
npm run render
```

일반 Chrome/Chromium 바이너리는 구 headless 모드가 제거돼서 동작하지 않습니다.
반드시 `headless_shell` 쪽을 가리켜야 합니다.
