// 앱인토스 SDK 브릿지 — 공유 기능을 미니앱 SDK에 연결해요.
import { share, getTossShareLink } from '@apps-in-toss/web-framework';

window.AppsInToss = {
  share,
  // 공유 링크: 토스 앱에서 이 미니앱을 바로 여는 딥링크
  getTossShareLink: () => getTossShareLink('intoss://how-old-am-i'),
};
