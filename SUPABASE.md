# 클로페이 — 클라우드 지갑(Supabase) 설정 가이드

기본 상태의 클로페이는 잔액이 **브라우저에만** 저장됩니다(로컬 데모 모드).
이 가이드를 따라 하면 **이메일 회원가입 + 어느 기기에서나 같은 지갑 + 회원 간 실제 송금**이
되는 클라우드 모드로 바뀝니다. Supabase 무료 요금제로 충분하며 서버 관리가 필요 없습니다.

## 왜 안전한가

- 잔액과 거래내역은 브라우저가 아닌 **Postgres DB**에 저장됩니다.
- 브라우저는 자기 지갑을 **읽기만** 할 수 있습니다 (Row Level Security).
- 잔액을 바꾸는 모든 동작(충전·결제·송금)은 DB 안의 함수(RPC)가 잔액 검사와 함께
  원자적으로 처리합니다. 개발자도구로 잔액을 조작할 수 없습니다.
- 카드 충전 반영(`credit_wallet`)은 승인 백엔드(Apps Script)의 service_role 키로만
  호출할 수 있고, 주문번호당 1회만 반영됩니다.

## 설정 (10분)

### 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 가입 → **New project** (무료)
2. 프로젝트가 준비되면 왼쪽 메뉴 **SQL Editor** → 이 저장소의 `supabase-schema.sql`
   내용 전체를 붙여넣고 **Run** → "Success" 확인

### 2. 키 두 개 복사

**Settings → API** 에서:

| 값 | 어디에 넣나 |
|----|-------------|
| Project URL (`https://xxxx.supabase.co`) | `pay-config.js`의 `supabaseUrl` + Apps Script 스크립트 속성 `SUPABASE_URL` |
| `anon` `public` 키 | `pay-config.js`의 `supabaseAnonKey` (공개돼도 괜찮은 키) |
| `service_role` 키 | **Apps Script 스크립트 속성 `SUPABASE_SERVICE_KEY`에만!** 절대 커밋 금지 |

### 3. 이메일 로그인 설정 (선택이지만 추천)

Supabase **Authentication → Providers → Email**:
- 간단히 쓰려면 **Confirm email 끄기** → 가입 즉시 로그인됩니다.
- 켜두면 가입 시 확인 메일이 발송되고, 앱이 "확인 메일을 보냈어요"라고 안내합니다.

### 4. 카드 충전을 DB 지갑에 연결

`payments-apps-script.gs`를 배포한 Apps Script 프로젝트의
**[프로젝트 설정 ⚙️ → 스크립트 속성]** 에 추가:

```
SUPABASE_URL         = https://xxxx.supabase.co
SUPABASE_SERVICE_KEY = (service_role 키)
```

→ 이후 토스페이먼츠 승인 성공 시 해당 회원의 DB 잔액까지 자동 반영됩니다.

### 5. 배포

`pay-config.js` 커밋/푸시 → GitHub Pages 반영 → 접속하면 로그인 화면이 먼저 뜹니다.

## 동작 방식

```
회원가입 → DB 트리거가 지갑(잔액 0원) 자동 생성
데모 충전/가맹점 결제 → RPC(demo_charge/pay_store)가 잔액 검사 후 원자 처리
송금 → send_money RPC: 상대 이메일로 지갑 찾기 → 두 지갑 잠금 → 이체 → 양쪽 거래내역 기록
카드 충전 → 토스 승인(Apps Script) 성공 → credit_wallet RPC(service_role) → DB 잔액 증가
```

## 자주 묻는 것

- **로그인 없이 쓰고 싶다** — `pay-config.js`의 `supabaseUrl`/`supabaseAnonKey`를 비우면
  이전처럼 로컬 데모 모드로 돌아갑니다.
- **PIN은 어디 저장되나** — PIN은 기기별(localStorage) 잠금입니다. 계정 보안은
  이메일+비밀번호(Supabase Auth)가 담당합니다.
- **거래내역이 100건까지만 보인다** — 앱이 최근 100건만 불러옵니다. 전체는
  Supabase 대시보드 → Table Editor → `transactions`에서 볼 수 있습니다.
- **무료 한도** — Supabase 무료 프로젝트는 DB 500MB, 월 활성 사용자 5만 명까지.
  취미/소규모 서비스에는 충분합니다.
