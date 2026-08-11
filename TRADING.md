# AUTO·TRADER 설정 가이드 (`auto-trader.html`)

사이버펑크 자동매매 터미널. 세 가지로 동작합니다.

| 단계 | 무엇 | 키 필요? | 어디서 도는가 |
|---|---|---|---|
| **① 시뮬레이션 (기본)** | 합성 데이터로 전체 화면 애니메이션 | ❌ | 브라우저만 |
| **② 실시간 시세** | Upbit / Binance 공개 WebSocket으로 진짜 캔들·호가·가격 | ❌ | 브라우저 → 거래소 |
| **③-A 실제 자동매매 · Alpaca** | Alpaca 모의투자 계좌로 진짜 주문 전송 (미국주식·코인) | ✅ | 브라우저 → Netlify Function → Alpaca |
| **③-B 실제 자동매매 · KIS** | 한국투자증권 모의투자로 진짜 주문 전송 (국내주식) | ✅ | 브라우저 → Netlify Function → KIS |

> ⚠️ **투자 유의**: 이 화면은 데모/도구입니다. 어떤 매매 신호도 투자 조언이 아니며, 손실 책임은 사용자에게 있습니다. 기본값은 **페이퍼(모의자금)** 이고, 실계좌(실제 돈)는 아래 `ALPACA_LIVE=true` 없이는 코드에서 아예 막혀 있습니다.

---

## ① 시뮬레이션 — 설정 불필요

파일을 브라우저로 열기만 하면 됩니다. 우측 상단 **◑ THEME** 로 다크/라이트 전환.

## ② 실시간 시세 — 키 없이 바로

1. 우측 상단 **⚙ SETUP** 클릭
2. **데이터 소스**에서 `UPBIT · 업비트` 또는 `BINANCE` 선택 → 마켓/심볼 고르기 → **저장·적용**
3. 상단 `DATA` 뱃지가 초록 `●` 로 바뀌면 실시간 연결됨. 캔들·호가·가격·통화기호(₩/$)가 실제 시세로 바뀝니다.

> 공개 시세 WebSocket이라 API 키가 필요 없습니다. 다만 일부 지역/네트워크에서 Binance 접속이 막힐 수 있어요. 한국이면 **Upbit** 를 권장합니다. 연결 실패 시 자동으로 4초마다 재접속합니다.

## ③ 실제 자동매매 — Alpaca 페이퍼 트레이딩

주문 API 키는 **절대 클라이언트(HTML)에 넣지 않습니다.** Netlify Function(`/api/broker`)이 서버에서 대신 호출합니다.

### 1. Alpaca 페이퍼 계좌 만들기
- <https://alpaca.markets> 가입 → **Paper Trading** 계정의 **API Key ID / Secret Key** 발급
- (미국 외 거주자도 페이퍼 계정은 대체로 생성 가능)

### 2. Netlify 환경변수 설정
Netlify → Site configuration → **Environment variables** 에 추가:

| 변수 | 값 | 필수 |
|---|---|---|
| `ALPACA_KEY_ID` | Alpaca API Key ID | ✅ |
| `ALPACA_SECRET_KEY` | Alpaca Secret Key | ✅ |
| `ALPACA_MAX_NOTIONAL` | 1건당 최대 주문 금액(USD). 기본 `100` | 선택 |
| `ALLOWED_ORIGINS` | 허용 출처 (쉼표 구분). 미설정 시 자기 도메인 | 선택 |
| `ALPACA_LIVE` | `true` 로 두면 **실계좌(실제 돈)**. 기본은 페이퍼 | ⚠️ 선택 |

저장 후 **재배포(Redeploy)** 해야 반영됩니다.

### 3. 터미널에서 켜기
1. **⚙ SETUP** → **트레이딩 엔진** 을 `PAPER · Alpaca 모의투자` 로
2. **Alpaca 심볼** 입력: 암호화폐 `BTC/USD`, `ETH/USD` / 미국주식 `AAPL`, `TSLA` 등
3. **1건 주문 금액**, **진입/익절/손절 %** 조정
4. **🔌 브로커 연결 테스트** 로 계좌 조회 확인 (equity가 뜨면 성공)
5. **ARM 스위치**:
   - **끄면 (DRY-RUN, 기본)** → 전략이 진입/청산을 계산·시각화만 하고 **주문은 안 나감**
   - **켜면 (ARMED)** → 실제 Alpaca 페이퍼 계좌로 시장가 주문 전송

### 전략 (기본 내장)
단순 **모멘텀 롱**입니다: 최근 N개 1분봉 수익률이 `진입 임계%` 이상이면 매수 → `익절%` 도달·`손절%` 이탈·최대 보유시간 초과 시 청산. 클라이언트 `auto-trader.html`의 `paperStrategy()` 에서 원하는 로직으로 바꾸세요.

### 안전장치
- 기본 base URL = `paper-api.alpaca.markets` (모의). `ALPACA_LIVE=true` 일 때만 실계좌.
- 주문 금액은 `ALPACA_MAX_NOTIONAL` 서버 상한을 넘으면 거부.
- 시크릿은 어떤 응답에도 포함되지 않음.
- 분당 60회 레이트리밋.

---

## ③-B 국내주식 자동매매 — 한국투자증권(KIS) 모의투자

국내 주식(예: 삼성전자 `005930`)을 자동매매하려면 KIS 엔진을 씁니다. 구조는 Alpaca와 동일하게 **서버리스 프록시**(`netlify/functions/kis.js`, `/api/kis`)가 키를 숨기고 대신 호출합니다.

### 1. KIS Open API 신청
- <https://apiportal.koreainvestment.com> 에서 앱 등록 → **APP Key / APP Secret** 발급
- **모의투자 계좌**를 개설하고 모의투자용 앱키를 사용하세요 (실전과 키가 다릅니다).

### 2. Netlify 환경변수
| 변수 | 값 | 필수 |
|---|---|---|
| `KIS_APP_KEY` | KIS 앱키 | ✅ |
| `KIS_APP_SECRET` | KIS 앱시크릿 | ✅ |
| `KIS_ACCOUNT` | 계좌 `종합8자리-상품2자리` (예: `50123456-01`) | ✅ |
| `KIS_ENV` | `vts`(모의, 기본) / `real`(실전, 실제 돈) | ⚠️ 선택 |
| `KIS_MAX_QTY` | 1건당 최대 주문 수량(주). 기본 `10` | 선택 |

저장 후 **재배포**.

### 3. 터미널에서 켜기
1. **⚙ SETUP → 트레이딩 엔진** 을 `KIS · 한투 모의` 로
2. **종목코드**(6자리)와 **주문 수량(주)** 입력
3. **🔌 브로커 연결 테스트** 로 잔고 조회 확인
4. **ARM** 켜면 실제 모의투자 주문 전송 (끄면 DRY-RUN)

- 데이터 소스를 `SIM` 으로 두면 KIS 시세 API로 해당 종목의 **실시간 현재가**를 폴링해 차트·전략에 반영합니다.
- 시장가(`ORD_DVSN=01`)로 체결하며 **국내장 개장시간(평일 09:00~15:30 KST)** 에만 실제 체결됩니다.
- 액세스 토큰은 서버에서 캐시(24h)합니다. 주문 수량은 `KIS_MAX_QTY` 상한으로 제한됩니다.

## 로컬 테스트
`file://` 로 열면 시뮬레이션·실시간 시세(②)는 되지만 브로커 프록시(③)는 안 됩니다. `③`을 테스트하려면 Netlify로 배포(또는 `netlify dev`)하세요.

## 브로커 확장
프런트엔드는 `/api/broker`(Alpaca) 또는 `/api/kis`(KIS)로 `{action, side, symbol/code, notional/qty}` 만 보냅니다. 다른 브로커(바이낸스 스팟 등)를 붙이려면 같은 응답 형태(`account.equity`, `order.status`)로 함수 하나만 추가하면 됩니다.
