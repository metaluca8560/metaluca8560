// 앱인토스 SDK 브릿지 — severance-calc.html의 공유 어댑터(window.AppsInToss)에 SDK를 연결해요.
import { share, getTossShareLink } from '@apps-in-toss/web-framework';

window.AppsInToss = {
  share,
  // 공유 링크: 토스 앱에서 이 미니앱을 바로 여는 딥링크
  getTossShareLink: () => getTossShareLink('intoss://severance-calc'),
};
