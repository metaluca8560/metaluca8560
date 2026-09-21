// 앱인토스 리뷰 요청 — 충분히 써본 유저에게 딱 한 번만 요청해요.
// 추천 미니앱 선정 기준에 리뷰가 포함되어 리뷰 수집을 시작해요 (2026-09 노출 정책 개편).
// 3번째 방문부터, 진입 직후를 방해하지 않도록 25초 뒤에 요청해요 (진입 직후 방해 금지 가이드 준수).
import { Review } from '@apps-in-toss/web-framework';

try {
  const ASKED = 'aitReviewAsked';
  const VISITS = 'aitVisitCount';
  const n = (parseInt(localStorage.getItem(VISITS) || '0', 10) || 0) + 1;
  localStorage.setItem(VISITS, String(n));
  if (!localStorage.getItem(ASKED) && n >= 3 && Review.request.isSupported()) {
    setTimeout(() => {
      localStorage.setItem(ASKED, '1');
      Review.request().catch(() => {});
    }, 25000);
  }
} catch (e) {
  // localStorage를 못 쓰는 환경에서는 조용히 건너뛰어요.
}
