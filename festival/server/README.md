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
   아래 **두 가지**를 각각 **활용신청**(자동승인)하세요.
   - 한국관광공사_국문 관광정보 서비스 (`KorService2`) — 사진이 있는 대표 축제
   - 행정안전부_전국문화축제표준데이터 — 지자체가 직접 등록하는 지역 축제

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

## 두 데이터 출처에 대해
관광공사 API만으로는 지역 축제가 많이 빠집니다(울산 기준 4건). 지자체가 직접 등록하는
표준데이터를 함께 조회해 합칩니다. 응답의 `source` 필드로 출처를 구분할 수 있습니다
(`tour` = 관광공사, `std` = 표준데이터).

표준데이터를 다룰 때 걸린 부분들:
- 최상위에 `response` 래퍼가 **없습니다**. `{header, body}`로 바로 옵니다. TourAPI와 다릅니다.
- `numOfRows`를 1000으로 주면 오류 대신 **200 응답에 0건**이 돌아옵니다. 100으로 요청합니다.
- 지역 필터 파라미터가 없어서 전체를 받아 **주소 앞부분**으로 거릅니다.
  반드시 주소 맨 앞과 비교해야 "경기도 광주시"가 광주광역시로 잘못 잡히지 않습니다.
- 날짜가 `2026-10-15` 형식이라 TourAPI(`20261015`)와 맞춰 정규화합니다.
- 지난 연도(2019~2025) 축제와 `1/1~12/31` 자리표시자 일정이 섞여 있어 걸러냅니다.
- 갱신주기가 분기라 응답을 6시간 캐싱합니다.

`/festivals?debug=1` 로 호출하면 출처별 조회 건수와 실패 원인을 볼 수 있습니다.

## 이 데이터로 안 잡히는 것
상설 시설의 시즌 프로그램(예: 태화강국가정원 납량특집)은 두 API 모두에 없습니다.
표준데이터는 지자체가 「문화예술진흥법」상 "축제"로 분류해 등록한 것만 담기기 때문입니다.
