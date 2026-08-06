# 백엔드 — AI 축제 큐레이터 (Cloudflare Worker)

정적 사이트는 API 키를 안전하게 숨길 수 없어서, 작은 무료 백엔드(Cloudflare Worker) 하나를
두고 거기서 키를 다룹니다. 프론트(`festival/`)는 이 Worker 주소만 알면 됩니다.

| 엔드포인트 | 설명 |
|------------|------|
| `GET /festivals?region=&from=&to=` | 지역·기간별 축제 목록 조회 — 공공데이터 TourAPI 프록시 |
| `POST /chat` | AI 대화 추천 — 실제 축제 목록을 조회해 근거로 삼아 AI가 골라줌 |

키는 **서버 환경변수(Secret)** 로만 두고 절대 프론트/깃에 올리지 않습니다.

## 준비물 (각 1회)
1. **Cloudflare 계정**(무료) + Node.js 설치
2. **Anthropic API 키** 또는 **Gemini API 키** — `/chat`에 필요 (Gemini 키가 있으면 우선 사용)
3. **공공데이터포털 서비스키** — [data.go.kr](https://www.data.go.kr)에서 **일반 인증키**를 발급받고,
   "한국관광공사_국문 관광정보 서비스"(`KorService2`)를 **활용신청**(자동승인)하세요.
   메디컬 앱 등 다른 프로젝트에서 이미 발급받은 인증키가 있다면 **그대로 재사용** 가능합니다
   (계정당 인증키는 하나, API마다 활용신청만 따로 하면 됩니다).

## 배포 (이 폴더에서)
```bash
# 1) 로그인 (이미 로그인했다면 생략)
npx wrangler login

# 2) 비밀키 등록 (입력창에 키 붙여넣기 — 파이프로 전달하면 Windows 크래시를 피할 수 있어요)
npx wrangler secret put GEMINI_API_KEY
# 또는: npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put DATA_GO_KR_KEY

# 3) 배포 → 끝나면 https://festival-api.<계정>.workers.dev 주소가 나옵니다
npx wrangler deploy
```

## 프론트 연결
배포로 받은 주소를 `festival/config.js`에 넣습니다:
```js
window.FESTIVAL_API_BASE = "https://festival-api.<계정>.workers.dev";
```

## 보안 메모
- 키는 `wrangler secret`로만 저장 — `wrangler.toml`·`config.js`·깃에 키를 넣지 마세요.
- 운영 시 `wrangler.toml`의 `ALLOW_ORIGIN`을 `"*"` 대신 본인 사이트 주소로 좁히세요.
- 키가 없으면 빈 목록/에러 메시지를 반환하도록 되어 있습니다.

## 참고
- TourAPI(`KorService2`)는 `eventStartDate`가 필수 파라미터라, 프론트에서 값을 안 보내면
  Worker가 오늘 날짜 ~ 90일 뒤로 자동 설정합니다.
- AI는 실제로 조회된 축제 목록만 근거로 추천하도록 시스템 프롬프트에서 강제하고 있습니다
  (목록에 없는 축제를 지어내지 않음).
