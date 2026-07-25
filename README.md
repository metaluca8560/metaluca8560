# METALUCA — 프로젝트 허브

metaluca의 개인 브랜드/포트폴리오 사이트입니다. 다크 테크 테마의 메인 허브에서
각 프로젝트로 이동할 수 있습니다. 순수 HTML/CSS/JS, 빌드 불필요.

## 구조

| 경로 | 설명 |
|------|------|
| `index.html` / `styles.css` / `script.js` | 메인 랜딩 — AI 교육·자동화 파트너 소개 (라이트 퍼플 테마, 성과 수치는 `script.js`의 `STATS`) |
| `automation/` | AI 트렌드 다락방 — 업무 자동화 & AI 챗봇 컨설팅 랜딩 (구 메인) |
| `medi/` | 오늘 어디 아파? — 증상 안내 & 병원 찾기 웹앱 |
| `canva-ai/` | 캔바 × AI 디자인 클래스 랜딩 |
| `artist/` | ATELIER — 작가 포트폴리오 템플릿 |
| `youtube-analyzer.html` 등 | 유튜브/릴스/틱톡 트렌드 분석 도구 |
| `apps-script.gs` | automation 폼의 Google Apps Script 백엔드 (설정법은 `automation/` 참고) |

## 테마 수정

`styles.css` 상단 `:root` 변수(`--cyan`, `--violet`, `--grad` 등)만 바꾸면 됩니다.
글꼴은 Pretendard.

## 실행

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 배포

정적 파일이라 Netlify, GitHub Pages, Vercel 등 어디든 그대로 올리면 됩니다.
현재 배포: https://luca-darakbang.netlify.app/ (Netlify 프로젝트 luca-darakbang, main 푸시 시 자동 배포)
