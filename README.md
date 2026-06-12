# AUTOSTUDIO — 업무 자동화 & AI 챗봇 컨설팅 랜딩 페이지

`autostudio.kro.kr` 스타일의 모바일 우선(One-Page) 랜딩 페이지입니다.
순수 HTML/CSS/JS만으로 동작하며 별도 빌드 과정이 필요 없습니다.

## 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 페이지 구조 (히어로 → 문제 제기 → 솔루션 카드 → 진행 단계 → 무료 진단 폼) |
| `styles.css` | 스타일 (모바일 우선, 720px 이상에서 데스크톱 레이아웃) |
| `script.js` | 스크롤 효과, 플로팅 CTA, 진단 폼 처리 |

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

## 배포

정적 파일이라 GitHub Pages, Netlify, Vercel, Cloudflare Pages 등 어디든 그대로 올리면 됩니다.
