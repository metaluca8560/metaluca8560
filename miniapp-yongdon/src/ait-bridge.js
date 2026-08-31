// 앱인토스 SDK 브릿지 — 공유 기능과 배너 광고를 미니앱 SDK에 연결해요.
import { share, getTossShareLink, TossAds } from '@apps-in-toss/web-framework';

// 광고 그룹 ID — 토스 광고 콘솔(앱인토스 개발자센터 > 광고 관리)에서 발급받으면 여기에 채워 넣어요.
// 비어 있는 동안은 광고를 아예 붙이지 않고, 오늘과 똑같이 동작해요.
//
// 지금 일부러 비워 둔 이유: 이 앱의 메인 화면은 배너를 넣어도 문서 높이가 뷰포트와
// 똑같아서(375×812 뷰포트에서 문서 812px) 스크롤이 아예 생기지 않아요. 앱인토스는
// 배너를 스크롤되는 화면에만 붙이도록 요구하는데, 이 화면은 그 조건을 못 채워요.
// 2026-09-30 검수에서 이 규칙이 실제로 어떻게 적용되는지 확인한 뒤에 다시 판단할
// 예정이니, 그 전까지는 여기에 광고 그룹 ID를 채워 넣지 마세요.
const AD_GROUP_ID = '';

// 같은 자리에 배너를 두 번 붙이지 않도록 이미 붙인 target을 기억해요.
const attachedTargets = new Set();

// 실패해도 화면이 절대 깨지면 안 되는 자리라 모든 단계를 try/catch로 감싸고,
// 문제가 있으면 조용히 null을 돌려줘요 (SDK 없음 / 미지원 / 광고 그룹 ID 미설정 / 예외 발생 전부 동일하게 처리).
function attachAdBanner(target) {
  if (!AD_GROUP_ID) return null;
  if (attachedTargets.has(target)) return null;
  try {
    if (!TossAds || typeof TossAds.attachBanner !== 'function') return null;
    if (typeof TossAds.attachBanner.isSupported === 'function' && !TossAds.attachBanner.isSupported()) {
      return null;
    }
    if (
      typeof TossAds.initialize === 'function' &&
      (typeof TossAds.initialize.isSupported !== 'function' || TossAds.initialize.isSupported())
    ) {
      TossAds.initialize({});
    }
    const result = TossAds.attachBanner(AD_GROUP_ID, target, { theme: 'auto' });
    attachedTargets.add(target);
    return result;
  } catch (e) {
    return null;
  }
}

window.AppsInToss = {
  share,
  // 공유 링크: 토스 앱에서 이 미니앱을 바로 여는 딥링크
  getTossShareLink: () => getTossShareLink('intoss://yongdon-speed'),
  attachAdBanner,
};
