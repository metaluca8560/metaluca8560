# 공용 백엔드 (`small-recipe-9345`)

여러 미니앱이 함께 쓰는 Cloudflare Worker입니다.

## 이 폴더가 생긴 이유

이 Worker는 **저장소에 소스가 없는 채로** 운영되고 있었습니다. 예전에 한 번 배포한
코드로 계속 돌아가고 있었고, 저장소에서 배포할 방법이 없었습니다. Worker가 지워지거나
문제가 생기면 복구가 불가능한 상태였습니다.

Cloudflare 대시보드의 배포본을 되살려 여기에 넣었습니다. 빌드 산출물이라 남아 있던
esbuild 흔적(`__name` 래퍼)과 유니코드 이스케이프를 걷어냈고, 엔드포인트 8개와
함수 16개가 배포본과 동일한지 대조해 확인했습니다.

## 엔드포인트

| 경로 | 메서드 | 쓰는 앱 |
|------|--------|---------|
| `/triage` | POST | 메디앱 — **현재는 `medi-api`로 이전됨** |
| `/recipe` | POST | 시장앱 |
| `/hospitals` | GET | 메디앱 — **현재는 `medi-api`로 이전됨** |
| `/tarot` | POST | 타로앱 |
| `/scan` | POST | OCR·손글씨·번역 스캔 |
| `/translate` | POST | 여행 회화 번역 |
| `/voice/tts` | POST | 음성 합성 |
| `/voice/stt` | POST | 받아쓰기 |

## 배포

```bash
npx wrangler deploy
```

`wrangler.toml`의 `name`은 **`small-recipe-9345`에서 바꾸지 마세요.** 시장·타로 등이
이 주소를 직접 가리키고 있어서, 이름을 바꾸면 그 앱들이 옛 Worker를 계속 보게 됩니다.

## Secret

현재 이 Worker에 등록된 것은 `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` 두 개입니다.
Gemini 키가 있으면 Gemini를 우선 사용합니다.

```bash
"키값" | npx wrangler secret put GEMINI_API_KEY
```

`DATA_GO_KR_KEY`는 **등록되어 있지 않습니다.** 따라서 `/hospitals`는 동작하지 않습니다.
메디앱이 `medi-api`로 옮겨간 뒤로 아무도 쓰지 않는 엔드포인트라 그대로 두었습니다.
되살릴 일이 생기면 그때 키를 넣으면 됩니다.

## 배포 전 주의

이 Worker는 앱 여러 개를 동시에 받치고 있습니다. 배포가 잘못되면 시장·타로·스캔·번역·
음성이 한꺼번에 영향을 받습니다. 고친 뒤에는 해당 앱들을 실제로 눌러 보고 확인하세요.

## medi와의 관계

`medi/server/`는 이 Worker에서 갈라져 나온 별도 배포(`medi-api`)입니다. `/triage`,
`/hospitals`가 양쪽에 중복으로 존재하며, 메디앱은 `medi-api` 쪽을 봅니다.
메디앱 쪽 코드를 고칠 때는 `medi/server/worker.js`를 고쳐야 합니다.
(`medi-api`에는 `/pharmacies`, `/hospitals-general`이 추가되어 있고, data.go.kr
오류 처리도 개선되어 있어 이 파일보다 최신입니다.)
