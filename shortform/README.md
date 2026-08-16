# 🚀 숏폼 떡상 판독기 Pro (v2) 배포 가이드

디지털다락방 LUCA 대표님을 위한 **숏폼 떡상 판독기 Pro** v2 배포 및 토스 미니앱 적용 가이드입니다.

---

## 📂 파일 구성

* `index.html` : 토스 TDS 감성의 모바일 최적화 메인 웹앱
* `style.css` : 반응형 디자인, 플랫폼별 컬러 테마, 부드러운 인터랙션
* `card-generator.js` : 1초 만에 인스타/단톡방 공유용 성적표 이미지를 생성하는 고해상도 Canvas 엔진
* `core.js` : 알고리즘 티어 산출, 1줄 처방전, AI 컨설팅 연동 및 로컬 히스토리 관리

---

## ⚡ 기존 넷리파이(Netlify) 사이트 교체 방법 (In-Place Upgrade)

기존 사이트의 트래픽(400명 유저)과 SEO, 백엔드 API 연동을 100% 보존하면서 갈아끼우는 방법:

1. 디지털다락방 깃허브 저장소의 `shortform/` 폴더로 이동합니다.
2. 폴더 내 파일들을 이번에 생성된 4개 파일(`index.html`, `style.css`, `card-generator.js`, `core.js`)로 덮어씌웁니다.
3. 깃 커밋 & 푸시 (`git push origin main`) 하면 Netlify에서 자동으로 즉시 배포 완료됩니다!

```bash
# 예시 커밋 메시지
git add shortform/
git commit -m "feat: 숏폼 떡상 판독기 Pro v2 대규모 업데이트 (1초 성적표 생성 & 퀵 모드)"
git push origin main
```

---

## 📱 토스 미니앱 (Apps in Toss) 등록 요령

1. **웹뷰 URL 설정**: 토스 개발자 콘솔의 Webview 진입 URL에 `https://luca-darakbang.netlify.app/shortform/` 등록
2. **모바일 최적화**: 100% 반응형 및 터치 제스처 최적화 완료
3. **공유 유도**: '성적표 이미지 저장' 및 '복사' 버튼이 내장되어 있어 토스 유저들의 소셜 바이럴을 즉시 유도합니다.
