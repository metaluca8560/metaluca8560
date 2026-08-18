# 시스템 지도 — 앱과 백엔드 연결

어느 앱이 어느 백엔드를 쓰는지, 어디에 배포되는지 정리한 문서입니다.

한 번은 앱의 AI 기능이 며칠간 죽어 있었는데 아무도 몰랐습니다. Worker 주소를 옮기면서
API 키를 같이 옮기지 않았고, 다른 기능은 멀쩡해서 겉보기엔 정상이었습니다. 그때
"어느 앱이 어느 백엔드를 보는지"를 아무도 한눈에 알 수 없다는 게 문제였습니다.

---

## 백엔드 한눈에 보기

백엔드는 크게 세 갈래입니다.

| 종류 | 어디에 | 소스 위치 |
|------|--------|-----------|
| Cloudflare Worker ×3 | `*.atlia0318.workers.dev` | `medi/server`, `festival/server`, `shared-api` |
| Netlify Functions | `luca-darakbang.netlify.app/api/*` | `netlify/functions/` |
| Vercel Functions | `metaluca8560.vercel.app/api/*` | `api/` |

### Cloudflare Worker

| Worker | 소스 | 엔드포인트 | 쓰는 앱 |
|--------|------|-----------|---------|
| `medi-api` | `medi/server/` | `/triage` `/hospitals` `/pharmacies` `/hospitals-general` | 메디앱 |
| `festival-api` | `festival/server/` | `/festivals` `/chat` | 축제앱 |
| `small-recipe-9345` | `shared-api/` | `/recipe` `/tarot` `/voice/tts` — 그리고 `/scan` `/translate` `/voice/stt` (+ 안 쓰는 `/triage` `/hospitals`) | 시장·타로·룩, 그리고 Firebase 앱들 |

`small-recipe-9345`는 **여러 앱을 동시에 받칩니다.** 배포가 잘못되면 한꺼번에 영향을
받으니, 고친 뒤에는 해당 앱들을 실제로 눌러 확인하세요. 이름을 바꾸면 앱들이 옛
Worker를 계속 보게 되므로 `wrangler.toml`의 `name`은 그대로 두어야 합니다.

`medi-api`는 `small-recipe-9345`에서 갈라져 나온 것이라 `/triage`, `/hospitals`가
양쪽에 중복 존재합니다. **메디앱은 `medi-api`를 봅니다.** 메디앱을 고칠 땐
`medi/server/worker.js`를 고치세요.

### 서버리스 함수

| 경로 | 하는 일 | 쓰는 앱 |
|------|---------|---------|
| `/api/proxy` | Anthropic API 중계 | 점심추천·축의금·연봉·퇴직금·휴가·운동용품·숏폼 |
| `/api/dream` | 꿈해몽 분석 | 꿈분석기, 꿈분석기 프로 |
| `/api/notify` | n8n 웹훅 중계(알림) | 꿈분석기 |
| `/api/confirm-payment` | 토스페이먼츠 결제 승인 | 결제 |
| `/api/broker` `/api/kis` `/api/upbit` | 증권·코인 시세 | 자동매매 |

---

## 앱별 연결

| 앱 | 위치 | 백엔드 |
|----|------|--------|
| 오늘 어디 아파? | `medi/` | `medi-api` |
| 우리동네 무슨 축제? | `festival/` | `festival-api` |
| 우리시장 | `market/` | `small-recipe-9345` `/recipe` |
| 타로 | `tarot/` | `small-recipe-9345` `/tarot` |
| 나좀봐 (룩) | `miniapp-look/` — Firebase판은 `huhsame-script` | `small-recipe-9345` `/voice/tts` |
| my scan2677 | `huhsame-script`의 `landing/scan/` | `small-recipe-9345` `/scan` |
| 마주톡 (번역) | `huhsame-script`의 `landing/talk/` | `small-recipe-9345` `/translate` |
| 킬링보이스 (음성) | `huhsame-script`의 `landing/voice/` | `small-recipe-9345` `/voice/tts` `/voice/stt` |
| 숏폼 분석 | `shortform/` | `/api/proxy` |
| 꿈분석기 / 프로 | `dream-analyzer*.html` | `/api/dream`, `/api/notify` |
| 점심 뭐 먹지 | `lunch-picker.html` | `/api/proxy` |
| 축의금 계산 | `gift-money.html` | `/api/proxy` |
| 연봉 분석 | `salary-analyzer.html` | `/api/proxy` |
| 퇴직금 계산 | `severance-calc.html` | `/api/proxy` |
| 여름휴가 | `summer-vacation.html` | `/api/proxy` |
| 운동용품 | `workout-gear.html` | `/api/proxy` |
| 결제 | `pay-app.html`, `checkout.html` | `/api/confirm-payment` |
| 자동매매 | `auto-trader.html` | `/api/broker` `/api/kis` `/api/upbit` |
| 나머지 (암 정보, 모기, 냥마을, 나이 계산, 분리수거 등) | 루트 HTML | 백엔드 없음 (정적) |

---

## 공공데이터 (data.go.kr)

인증키는 **계정당 하나**입니다. API마다 **활용신청만 따로** 하면 되고, 키는 재사용합니다.
Worker에는 `DATA_GO_KR_KEY` 시크릿으로 등록합니다.

| API | 쓰는 곳 | 용도 |
|-----|---------|------|
| `B552657/ErmctInfoInqireService` | `medi-api` | 응급실 위치 |
| `B552657/ErmctInsttInfoInqireService` | `medi-api` | 약국 위치 |
| `B551182/hospInfoServicev2` | `medi-api` | 병원·의원 검색 |
| `B551011/KorService2` (TourAPI) | `festival-api` | 축제 정보 (사진 있음) |
| `tn_pubr_public_cltur_fstvl_api` | `festival-api` | 전국문화축제표준데이터 (지역 축제) |

**활용신청 만료일은 2028년**입니다. 만료되면 data.go.kr이 HTTP 200에 오류 본문을
담아 보내므로, 코드에서 응답 본문의 오류 코드를 검사합니다(그러지 않으면 "결과 없음"으로
보입니다). 헬스체크가 이 상황을 잡아냅니다.

### 표준데이터 API 다룰 때 주의

- 최상위에 `response` 래퍼가 **없습니다**. `{header, body}`로 바로 옵니다. TourAPI와 다릅니다.
- `numOfRows`를 1000으로 주면 오류 대신 **200 응답에 0건**이 옵니다. 100으로 요청합니다.
- 지역 필터 파라미터가 없어 전체를 받아 주소 앞부분으로 거릅니다.

---

## 호스팅

같은 저장소가 **네 곳**에 배포됩니다.

| 도메인 | 무엇 | 배포 방식 |
|--------|------|-----------|
| `luca-darakbang.netlify.app` | 주 사이트 | Netlify (푸시 시 자동) |
| `metaluca8560.vercel.app` | Vercel 배포 | Vercel (푸시 시 자동) |
| `metaluca8560.github.io` | GitHub Pages | `.github/workflows/deploy-pages.yml` |
| `vaulted-bus-346411.web.app` | 별도 포털 — 나좀봐·스캔·마주톡·타로·킬링보이스 | Firebase (수동) |

앱마다 `og:image`가 가리키는 도메인이 달라서, 링크 공유 시 이미지가 안 뜨면 그 앱이
어느 도메인 기준으로 작성됐는지 먼저 확인하세요.

---

## 자동 점검

`.github/workflows/api-healthcheck.yml` — 매일 오전 9시(KST) 백엔드 11개 항목을
확인하고, 실패하면 GitHub이 메일로 알립니다.

빈 요청 `{}`을 보내 응답 코드로 상태를 가릅니다. 각 핸들러가 "키 검사 → 입력 검사"
순서라서, **400이면 키가 등록된 것**이고 AI 호출은 일어나지 않아 비용이 들지 않습니다.
500이면 키 누락, 무응답이면 Worker가 죽은 것입니다.

수동 실행: Actions 탭 → API Health Check → Run workflow

공공데이터가 간헐적으로 522를 내므로 재시도를 한 번 넣었지만 헛알람이 아주 없지는
않습니다. 실패 메일이 왔는데 앱이 멀쩡하면 Re-run 해보세요.

---

## 확인이 필요한 것들

정리하면서 발견했지만 아직 손대지 않은 것들입니다.

**축제앱이 포털에 없습니다.** `index.html`에 `festival/` 링크가 없어서 주소를 직접
알아야만 들어갈 수 있습니다. 시장앱(`market/`)도 마찬가지입니다.

**`/api/dream`이 Netlify에 없습니다.** `netlify.toml`은 `proxy`·`confirm-payment`·
`notify`·`broker`·`kis`·`upbit`만 연결하고 `dream`은 없습니다. `api/dream.js`는 Vercel
형식이라, 꿈분석기는 Vercel 도메인에서만 동작할 가능성이 있습니다. 그런데 꿈분석기의
`og:image`는 Netlify 도메인을 가리킵니다. 실제로 어느 쪽에서 쓰이는지 확인이 필요합니다.

**`market/`에 파일이 두 벌 있습니다.** `app.js`와 `우리시장_app_새버전.js`가 둘 다
있는데 어느 쪽이 실제로 쓰이는지 불명확합니다. `index.html`과 `우리시장_index_새버전.html`도
마찬가지입니다.

**공용 Worker에 `DATA_GO_KR_KEY`가 없습니다.** 그래서 거기 있는 `/hospitals`는 동작하지
않습니다. 메디앱이 `medi-api`로 옮겨간 뒤 아무도 쓰지 않는 엔드포인트라 그대로 두었습니다.

**Firebase 앱의 프론트는 다른 저장소에 있습니다** — `metaluca27/huhsame-script`의
`landing/`. 백엔드(`shared-api/`)는 이 저장소에 있으니, **프론트와 백엔드가 서로 다른
저장소에 나뉘어 있습니다.** 자세한 건 `firebase-apps/README.md` 참고.

그 저장소는 원래 원격이 없어 PC 바탕화면에만 있었습니다(커밋 64개). 백업했습니다.
거기에 포털에 링크되지 않은 앱 3개(곁별, 다락방 짝꿍 찾기, 리버스 스와이프)와
Cloudflare Worker 설정(`docs/worker/`)도 들어 있습니다. **이 저장소의 헬스체크는
그 Worker를 확인하지 않습니다.**

Firebase는 수동 배포입니다(`huhsame-script`에서 `firebase deploy`). 푸시만으로는
반영되지 않습니다.
