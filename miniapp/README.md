# 급여명세서 해석기 — 앱인토스 미니앱 패키지

루트의 `salary-analyzer.html`(웹 버전)을 앱인토스 미니앱으로 패키징하는 프로젝트입니다.
원본은 한 벌만 유지하고, 미니앱 전용 차이는 `sync.mjs`가 빌드 때 주입합니다:

- API 프록시 주소를 절대 경로(`https://metaluca8560.vercel.app/api/proxy`)로 교체
- 앱인토스 SDK 공유 브릿지(`src/ait-bridge.js`) 주입 → `window.AppsInToss.share`
- 미니앱 밖으로 나가는 링크 제거 (검수 가이드라인)

## 구조

| 파일 | 역할 |
|---|---|
| `granite.config.ts` | 앱인토스 설정 — appName `salary-analyzer` (콘솔 등록값과 일치 필수) |
| `sync.mjs` | `../salary-analyzer.html` → `index.html` 변환 |
| `src/ait-bridge.js` | SDK `share`/`getTossShareLink`를 웹앱 어댑터에 연결 |

## 명령어

```bash
npm install        # 최초 1회
npm run dev        # 로컬 개발 (토스 앱 샌드박스로 QR 접속 가능)
npm run build      # salary-analyzer.ait 아티팩트 빌드
```

## 배포 (콘솔 API 키 필요)

```bash
# 최초 1회: 콘솔 > API 키에서 발급받은 키 등록
npx ait token add --api-key <콘솔_API_키>

npm run build
npx ait deploy
```

배포 후 앱인토스 콘솔 > 앱 출시 메뉴에서 검수를 요청하세요.

## 주의

- 검수 기준상 게임이 아닌 웹뷰 미니앱은 토스 디자인 시스템(TDS) 적용을 요구할 수 있습니다.
  1차 검수 피드백을 받으면 그에 맞춰 대응하세요.
- Vercel 환경변수 `CLAUDE_API_KEY`가 있어야 AI 해석이 동작합니다.
