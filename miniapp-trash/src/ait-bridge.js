// 앱인토스 SDK 브릿지 — 공유 기능을 미니앱 SDK에 연결해요.
import { share, getTossShareLink } from '@apps-in-toss/web-framework';

window.AppsInToss = {
  share,
  // 공유 링크: 토스 앱에서 이 미니앱을 바로 여는 딥링크
  getTossShareLink: () => getTossShareLink('intoss://trash-guide'),
};

// 리뷰 요청 로직 (방문 3회차에 한 번만)
import './ait-review.js';
