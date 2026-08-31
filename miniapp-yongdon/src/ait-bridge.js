// 앱인토스 SDK 브릿지 — 공유 기능과 배너 광고를 미니앱 SDK에 연결해요.
import { share, getTossShareLink, TossAds, isMinVersionSupported } from '@apps-in-toss/web-framework';

// 광고 그룹 ID — 토스 광고 콘솔(앱인토스 개발자센터 > 광고 관리)에서 발급받으면 여기에 채워 넣어요.
// 비어 있는 동안은 광고를 아예 붙이지 않고, 오늘과 똑같이 동작해요.
//
// 지금 일부러 비워 둔 이유: 이 앱의 메인 화면은 배너를 넣어도 문서 높이가 뷰포트와
// 똑같아서(375×812 뷰포트에서 문서 812px) 스크롤이 아예 생기지 않아요. 앱인토스는
// 배너를 스크롤되는 화면에만 붙이도록 요구하는데, 이 화면은 그 조건을 못 채워요.
// 2026-09-30 검수에서 이 규칙이 실제로 어떻게 적용되는지 확인한 뒤에 다시 판단할
// 예정이니, 그 전까지는 여기에 광고 그룹 ID를 채워 넣지 마세요.
const AD_GROUP_ID = '';

// 실기기 테스트용 안전장치 — 진짜 광고 그룹 ID가 아직 없어도 배너가 실제로 붙는지
// 확인할 수 있게 해줘요. `npm run build:test-ads` 로 빌드할 때만 .env.ait-test-ads
// 파일이 읽혀서 앱인토스 공식 테스트 배너 ID가 여기에 채워져요. 평소 `npm run build`
// (그리고 `npm run web:build`)는 이 파일을 전혀 안 보기 때문에, 테스트 ID 문자열
// 자체가 결과물(dist)에 절대 섞이지 않아요. 그리고 위 AD_GROUP_ID에 진짜 값이
// 채워지면 아래 줄은 조건문에서 아예 안 쓰이니 신경 쓸 필요 없어요.
const TEST_AD_GROUP_ID = (import.meta.env && import.meta.env.VITE_AIT_AD_TEST_ID) || '';

// 화면은 hidden 처리(또는 클래스 토글)만 될 뿐 DOM에서 사라지지 않는 구조라, 대부분은
// 한 번만 붙이면 끝이에요. target별로 "지금 붙어 있는 핸들"을 기억해뒀다가, 같은 화면에
// 다시 들어와도 엘리먼트가 그대로 살아있으면 다시 붙이지 않고(=배너가 겹치지 않게),
// 혹시 엘리먼트가 통째로 교체/제거된 적이 있으면 그때는 예전 핸들부터 destroy()로
// 정리하고 새로 붙여요 (앱인토스 문서: attachBanner가 돌려주는 destroy()를 안 부르면
// 리소스가 샌다고 안내함).
const attachedBanners = new Map();

function resolveElement(target) {
  return typeof target === 'string' ? document.getElementById(target) : target;
}

// 실패해도 화면이 절대 깨지면 안 되는 자리라 모든 단계를 try/catch로 감싸고,
// 문제가 있으면 조용히 null을 돌려줘요 (SDK 없음 / 미지원 / 구버전 토스 / 광고 그룹 ID
// 미설정 / 예외 발생 전부 동일하게 처리).
function attachAdBanner(target) {
  const adGroupId = AD_GROUP_ID || TEST_AD_GROUP_ID;
  if (!adGroupId) return null;
  try {
    const existing = attachedBanners.get(target);
    if (existing) {
      if (existing.el && existing.el.isConnected) return existing.handle;
      try { existing.handle.destroy(); } catch (e) {}
      attachedBanners.delete(target);
    }
    if (!TossAds || typeof TossAds.attachBanner !== 'function') return null;
    if (typeof TossAds.attachBanner.isSupported === 'function' && !TossAds.attachBanner.isSupported()) {
      return null;
    }
    // 배너 광고는 토스 앱 5.241.0 이상에서만 지원돼요. 그보다 낮은 버전에서는 빈
    // 영역이 생길 수 있어서, 붙이기 전에 반드시 최소 버전을 확인해요.
    if (
      typeof isMinVersionSupported === 'function' &&
      !isMinVersionSupported({ android: '5.241.0', ios: '5.241.0' })
    ) {
      return null;
    }
    if (
      typeof TossAds.initialize === 'function' &&
      (typeof TossAds.initialize.isSupported !== 'function' || TossAds.initialize.isSupported())
    ) {
      TossAds.initialize({});
    }
    const handle = TossAds.attachBanner(adGroupId, target, { theme: 'auto' });
    attachedBanners.set(target, { el: resolveElement(target), handle });
    return handle;
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
