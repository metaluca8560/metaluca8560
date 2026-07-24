/* ============================================================
   클로페이 결제 설정 — 이 파일만 수정하면 됩니다
   ============================================================
   1) clientKey
      - 지금은 토스페이먼츠 공식 문서의 "공용 테스트 키"입니다.
        결제창까지 전부 동작하지만 실제 돈은 빠져나가지 않습니다.
      - 실결제 전환: https://developers.tosspayments.com 상점 가입 후
        [내 개발정보]에서 발급받은 라이브 클라이언트 키(live_gck_...)로 교체.
        (라이브 키 발급에는 사업자등록 + 전자결제 계약 심사가 필요합니다)

   2) confirmEndpoint
      - 결제 승인(확정)을 처리하는 백엔드 주소입니다.
        payments-apps-script.gs 를 Google Apps Script 웹 앱으로 배포하고
        그 URL(https://script.google.com/macros/s/.../exec)을 넣으세요.
      - 비워두면: 결제창 인증까지만 진행되고 승인은 생략됩니다.
        (테스트 키에서는 체험용으로 충전이 반영되지만 "미승인" 표시가 붙습니다.
         라이브 키에서는 승인 없이는 실제 청구가 완료되지 않습니다)
   ============================================================ */
/* 3) supabaseUrl / supabaseAnonKey — 클라우드 지갑 (선택)
      - 설정하면: 이메일 로그인 + 어느 기기에서나 같은 잔액(DB 저장) + 회원 간 실제 송금.
        supabase.com 무료 프로젝트 생성 → SQL Editor에서 supabase-schema.sql 실행 →
        [Settings > API]의 Project URL과 anon public 키를 아래에 입력. (SUPABASE.md 참고)
      - 비워두면: 지금처럼 이 브라우저에만 저장되는 로컬 데모 모드.
      - anon 키는 공개되어도 되는 키입니다. service_role 키는 절대 여기 넣지 마세요! */
window.CLOPAY_CONFIG = {
  clientKey: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm", // 공식 문서 공용 테스트 키
  confirmEndpoint: "https://script.google.com/macros/s/AKfycbxe9GQLJwFgsUoBQ43jSOwmJCjGtKhpMEqis_KU8-8FB24am6S6K3qSLaEej-4dQ2sDrg/exec", // Apps Script 웹 앱 (클로페이 결제승인)
  supabaseUrl: "https://ermdkptzpipumxkqaiex.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybWRrcHR6cGlwdW14a3FhaWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4Nzc0NTUsImV4cCI6MjEwMDQ1MzQ1NX0.rVlX1qHA18kYa9B7klSofztByhvZqXw-LMDXNPv0i_E",
};
