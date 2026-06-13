# 백엔드 — AI 문진 & 실시간 병원 목록 (Cloudflare Worker)

정적 사이트는 API 키를 안전하게 숨길 수 없어서, 작은 무료 백엔드(Cloudflare Worker) 하나를
두고 거기서 키를 다룹니다. 프론트(`medi/`)는 이 Worker 주소만 알면 됩니다.

| 엔드포인트 | 설명 |
|------------|------|
| `POST /triage` | AI 문진 — Claude Messages API 호출. 레드플래그 가드레일을 시스템 프롬프트로 강제 |
| `GET /hospitals?lat=&lng=&type=` | 위치기반 응급/병원 목록 — 공공데이터 E-Gen 프록시 |

키는 **서버 환경변수(Secret)** 로만 두고 절대 프론트/깃에 올리지 않습니다.

## 준비물 (각 1회)
1. **Cloudflare 계정**(무료) + Node.js 설치
2. **Anthropic API 키** — [console.anthropic.com](https://console.anthropic.com) → API Keys (`/triage`에 필요)
3. (선택) **공공데이터포털 서비스키** — [data.go.kr](https://www.data.go.kr)에서
   "응급의료정보(ErmctInfoInqireService)" 활용신청 → 일반 인증키(Decoding) 발급 (`/hospitals`에 필요)

## 배포 (이 폴더에서)
```bash
# 1) 로그인
npx wrangler login

# 2) 비밀키 등록 (입력창에 키 붙여넣기)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put DATA_GO_KR_KEY     # 병원 목록까지 쓸 때만

# 3) 배포 → 끝나면 https://medi-api.<계정>.workers.dev 주소가 나옵니다
npx wrangler deploy
```

## 프론트 연결
배포로 받은 주소를 `medi/config.js`에 넣습니다:
```js
window.MEDI_API_BASE = "https://medi-api.<계정>.workers.dev";
```
저장하고 새로고침하면 **🤖 AI 문진**과 **🔄 실시간 병원 목록**이 켜집니다.

## 모델 / 비용
- 기본 모델은 `worker.js`의 `MODEL = "claude-opus-4-8"` 입니다.
- 비용을 낮추려면 `"claude-sonnet-4-6"`(균형) 또는 `"claude-haiku-4-5"`(가장 저렴)로 바꾸세요.
- Anthropic·Cloudflare 사용량에 따라 요금이 부과될 수 있습니다(소규모는 보통 매우 적음).

## 보안 메모
- 키는 `wrangler secret`로만 저장 — `wrangler.toml`·`config.js`·깃에 키를 넣지 마세요.
- 운영 시 `wrangler.toml`의 `ALLOW_ORIGIN`을 `"*"` 대신 본인 사이트 주소로 좁히세요.
- `/hospitals`의 공공데이터 엔드포인트·필드명은 신청한 오퍼레이션에 맞게
  `worker.js`에서 조정할 수 있습니다(주석 참고). 키가 없으면 빈 목록을 반환하고
  프론트는 지도검색으로 폴백합니다.

## 안전 고지
이 서비스의 모든 안내는 **참고용이며 의학적 진단·처방이 아닙니다.** 위급 시 119.
AI 문진도 레드플래그 시 119/응급실을 최우선으로 안내하도록 설계했지만,
실제 서비스 전에는 의료 전문가 감수를 권장합니다.
