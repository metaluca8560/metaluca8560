# AI 트렌드 다락방 — 업무 자동화 & AI 챗봇 컨설팅 랜딩 페이지

"AI 트렌드 다락방" — 반복 업무 자동화 & AI 챗봇 컨설팅 모바일 우선(One-Page) 랜딩 페이지입니다.
쿨 모던(네이비·블루·민트, 산세리프) 테마로, 순수 HTML/CSS/JS만으로 동작하고 빌드 과정이 필요 없습니다.

## 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 페이지 구조 (내비 → 다크 히어로/자동화 흐름 → 수치 배너 → 공감 → 벤토 기능 그리드 → 도입 전·후 비교 → 4단계 진행 → FAQ → CTA/폼 → 푸터) |
| `styles.css` | 스타일 (쿨 모던 테마, 모바일 우선, 760px 이상 데스크톱 레이아웃·벤토 그리드) |
| `script.js` | 네비 효과, 히어로 흐름 애니메이션, FAQ 아코디언, 플로팅 CTA, 진단 폼 처리 |
| `logo.svg` | 로고 심볼 (다락방 + 트렌드 화살표 + AI 반짝임). 파비콘·OG 이미지로 사용 |
| `logo-full.svg` | 가로 조합형 로고 (심볼 + 워드마크) |

## 테마

`styles.css` 상단 `:root`에 테마 색을 변수로 모아두었습니다. 분위기를 바꾸려면 여기만 수정하세요.
글꼴은 `Pretendard`(산세리프)를 사용합니다.

## 실행 방법

`index.html`을 브라우저에서 바로 열어도 되고, 로컬 서버로 확인하려면:

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 커스터마이징 포인트

- **문구/카드 내용**: `index.html`에서 직접 수정
- **색상/폰트**: `styles.css` 상단의 `:root` 변수
- **무료 진단 폼 전송**: 현재는 데모입니다. `script.js`의 `// TODO` 부분에서
  이메일·카카오 채널·Google Sheets·Formspree 등으로 연동하세요.

## "무료 진단" 버튼 → 카카오톡 챗봇 연결

`data-cta="kakao"`가 붙은 버튼(상단 내비, 히어로, 플로팅, CTA 섹션)은 카카오톡 채널 채팅을
바로 열 수 있습니다. 연결 방법:

1. [카카오톡 채널 관리자센터](https://center-pf.kakao.com)에서 채널을 만듭니다.
2. (자동 응답을 원하면) [카카오 i 오픈빌더](https://i.kakao.com)에서 챗봇을 만들어 채널에 연결합니다.
3. 채널 URL `http://pf.kakao.com/_XXXXXX` 에서 `_XXXXXX` 부분을 복사합니다.
4. `script.js` 상단의 `KAKAO_CHANNEL_ID` 값에 붙여넣습니다. 예: `const KAKAO_CHANNEL_ID = "_abcdEF";`

> ID를 비워두면 버튼은 자동으로 하단 문의 폼으로 스크롤됩니다(미설정 시 graceful fallback).
> 채널 가입 화면의 "사업자 정보 미확인" 경고를 없애려면 카카오 채널에서 사업자 인증을 받으면 됩니다.

## 문의 폼 연동 (이메일 / 구글시트)

`script.js` 상단의 `FORM_ENDPOINT` 한 곳에 주소만 넣으면 됩니다. 두 방식 모두 지원:

**방법 A — Formspree (폰만으로 가능, 이메일 알림)**
1. [formspree.io](https://formspree.io) 무료 가입 → New Form 생성
2. `https://formspree.io/f/XXXXXXXX` 주소 복사
3. `FORM_ENDPOINT` 에 붙여넣기 → 제출 시 이메일로 알림

**방법 B — Google Apps Script (PC 필요, 구글시트 기록 + 이메일 알림)**
1. 구글 스프레드시트 생성 → **확장 프로그램 → Apps Script**
2. `apps-script.gs` 내용 붙여넣기 (필요하면 `NOTIFY_EMAIL` 수정)
3. **배포 → 새 배포 → 웹 앱**(액세스: 모든 사용자) → 웹앱 URL(…/exec) 복사
4. `FORM_ENDPOINT` 에 붙여넣기

> 설정 전에는 폼이 데모로 동작(전송 없이 안내 메시지)합니다.
> 코드가 주소를 보고 자동으로 전송 방식을 선택합니다(Formspree=JSON, Apps Script=no-cors).

## 배포

정적 파일이라 GitHub Pages, Netlify, Vercel, Cloudflare Pages 등 어디든 그대로 올리면 됩니다.
