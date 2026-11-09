// 카카오톡 공유 버튼 — 웹 버전 미니앱 공통 스크립트.
//
// 페이지의 기존 공유 버튼(onclick="shareResult()") 옆에 노란 "카톡 공유" 버튼을 붙이고,
// 페이지가 이미 가진 buildShareText()로 만든 문구 + og:image 썸네일로 카카오 피드 카드를 보내요.
//
// 설정: developers.kakao.com > 내 애플리케이션 > 앱 키 > JavaScript 키를 아래에 넣고,
//       플랫폼 > Web > 사이트 도메인에 배포 주소를 등록하세요.
//       (https://metaluca8560.vercel.app, https://luca-darakbang.netlify.app)
// 키가 비어 있으면 모바일 공유 시트(카카오톡 선택 가능) → 클립보드 복사로 대체돼요.
//
// 앱인토스(토스 미니앱) 안에서는 버튼을 만들지 않아요. 미니앱은 토스 공유(AppsInToss.share)만 써요.
(function () {
  var KAKAO_JS_KEY = ''
  var SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js'

  function meta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"]')
    return el ? el.getAttribute('content') : ''
  }

  function loadSdk() {
    return new Promise(function (resolve, reject) {
      if (window.Kakao) return resolve()
      var s = document.createElement('script')
      s.src = SDK_URL
      s.onload = resolve
      s.onerror = function () { reject(new Error('카카오 SDK 로드 실패')) }
      document.head.appendChild(s)
    })
  }

  function shareContent() {
    var text = typeof window.buildShareText === 'function' ? window.buildShareText() : document.title
    var lines = String(text).split('\n')
    var url = location.href.split('#')[0]
    return {
      title: lines[0] || document.title,
      description: lines.slice(1).join(' ').trim() || meta('og:description'),
      text: text,
      url: url,
      imageUrl: meta('og:image'),
    }
  }

  async function shareKakao() {
    var c = shareContent()
    if (KAKAO_JS_KEY) {
      try {
        await loadSdk()
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY)
        var link = { webUrl: c.url, mobileWebUrl: c.url }
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: c.title, description: c.description, imageUrl: c.imageUrl, link: link },
          buttons: [{ title: '나도 해보기', link: link }],
        })
        return
      } catch (e) { console.log('카카오 공유 실패, 대체 공유 사용:', e.message) }
    }
    if (navigator.share) {
      try { await navigator.share({ title: c.title, text: c.text, url: c.url }); return }
      catch (e) { if (e.name === 'AbortError') return }
    }
    try {
      await navigator.clipboard.writeText(c.text + '\n' + c.url)
      alert('공유 문구가 복사됐어요!\n카카오톡 대화방에 붙여넣어 주세요 💬')
    } catch (_) { alert('복사에 실패했어요. 주소창의 링크를 직접 공유해 주세요.') }
  }

  function mount() {
    if (window.AppsInToss) return
    var anchor = document.querySelector('button[onclick="shareResult()"]')
    if (!anchor || document.getElementById('kakaoShareBtn')) return
    var btn = document.createElement('button')
    btn.id = 'kakaoShareBtn'
    btn.type = 'button'
    btn.className = anchor.className
    btn.textContent = '💬 카톡 공유'
    btn.style.cssText = 'background:#FEE500;color:#191919;border-color:#FEE500;font-weight:700'
    btn.addEventListener('click', shareKakao)
    anchor.insertAdjacentElement('afterend', btn)
  }

  window.shareKakao = shareKakao
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount)
  else mount()
})()
