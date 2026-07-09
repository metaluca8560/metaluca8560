# 클로페이 — 실결제(토스페이먼츠) 연동 가이드

클로페이 지갑 충전에 **토스페이먼츠 결제위젯**이 연동되어 있습니다.
카드 · 토스페이 · 네이버페이 등으로 실제 결제창을 띄워 충전하는 구조입니다.

## 파일 구성

| 파일 | 역할 |
|------|------|
| `pay-app.html` | 지갑 앱 본체. [충전] → 카드 충전 선택 시 결제 페이지로 이동 |
| `checkout.html` | 결제 페이지. 토스페이먼츠 결제위젯을 렌더링하고 결제 요청 |
| `pay-success.html` | 결제 인증 성공 후 돌아오는 페이지. 승인 API 호출 → 지갑 잔액 반영 |
| `pay-fail.html` | 결제 실패/취소 시 돌아오는 페이지 |
| `pay-config.js` | **설정 파일. 키와 승인 서버 주소를 여기에만 넣으면 됨** |
| `payments-apps-script.gs` | 결제 승인(confirm) 백엔드. Google Apps Script로 무료 운영 |

## 결제 흐름

```
[pay-app.html] 충전 버튼
   → [checkout.html?amount=30000] 결제위젯에서 카드 선택·인증
   → 토스페이먼츠가 successUrl로 리다이렉트 (paymentKey, orderId, amount)
   → [pay-success.html] Apps Script(confirmEndpoint)에 승인 요청
   → Apps Script가 시크릿 키로 토스 승인 API 호출 + 구글시트 원장 기록 + 메일 알림
   → 승인 성공 시 지갑 잔액 반영
```

시크릿 키는 절대 브라우저(HTML/JS)에 넣지 마세요. 승인 호출은 반드시 서버(Apps Script)에서 합니다.

## 1단계 — 지금 바로: 테스트 결제 (돈 안 나감)

기본 설정이 토스페이먼츠 공식 문서의 **공용 테스트 키**라서, GitHub Pages 등에 올리면
바로 결제창이 뜹니다. 아무 카드번호로 진행해도 실제 청구는 되지 않습니다.

## 2단계 — 승인 백엔드 붙이기 (5분)

1. [script.google.com](https://script.google.com) → 새 프로젝트
2. `payments-apps-script.gs` 내용 전체 붙여넣기
3. 함수 `testConfirm` 한 번 실행 → 권한 허용 (결과가 "승인실패"로 나오는 게 정상)
4. [배포] → [새 배포] → 웹 앱 (실행: 나 / 액세스: **모든 사용자**) → URL 복사
5. `pay-config.js`의 `confirmEndpoint`에 붙여넣기 → 커밋/배포

이제 테스트 결제도 승인까지 완주하고, 구글시트 "클로페이 결제내역"에 원장이 쌓이고
메일 알림(`payments-apps-script.gs`의 `NOTIFY_EMAIL`)이 옵니다.

## 3단계 — 진짜 돈이 오가는 라이브 전환

라이브 결제는 법적으로 **사업자 + PG 계약**이 필요합니다.

1. **사업자등록** (홈택스에서 무료, 통신판매업 신고 포함 권장)
2. [토스페이먼츠 가입](https://www.tosspayments.com) → 전자결제 신청 → 계약 심사 (보통 수일)
3. 심사 통과 후 [개발자센터 > 내 개발정보]에서 **라이브 키** 발급
   - `live_gck_...` (클라이언트 키) → `pay-config.js`의 `clientKey`
   - `live_gsk_...` (시크릿 키) → Apps Script [프로젝트 설정 > 스크립트 속성]에 `TOSS_SECRET_KEY`로 저장
4. 결제 페이지는 **HTTPS 필수** — GitHub Pages는 기본 HTTPS라 그대로 사용 가능

> ⚠️ 라이브 시크릿 키는 절대 저장소에 커밋하지 마세요. 스크립트 속성에만 넣습니다.

## 알아둘 점 / 한계

- 지갑 잔액은 현재 **브라우저 localStorage**에 저장됩니다. 기기를 바꾸면 잔액이 따라가지
  않으므로, 라이브 서비스로 키우려면 회원/잔액 DB(예: Supabase, Firebase)가 다음 단계입니다.
- 결제 취소(환불)는 토스페이먼츠 상점관리자에서 하거나, 승인과 같은 방식으로
  `POST /v1/payments/{paymentKey}/cancel` API를 Apps Script에 추가하면 됩니다.
- 미성년자 결제, 정기결제(빌링), 에스크로 등은 별도 계약 옵션입니다.

## 테스트 체크리스트

- [ ] `checkout.html?amount=10000` 접속 → 결제위젯 렌더링
- [ ] 테스트 결제 진행 → `pay-success.html`에서 "충전 완료" 확인
- [ ] `pay-app.html` 잔액 증가 + 거래내역에 "카드 충전" 표시
- [ ] 결제창에서 X로 닫기 → 다시 결제 버튼 활성화
- [ ] 새로고침해도 중복 충전되지 않음 (주문번호 중복 방지)
- [ ] 구글시트 "클로페이 결제내역"에 행 추가 + 메일 수신 (2단계 이후)
