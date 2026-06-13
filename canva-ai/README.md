# 캔바 × AI 디자인 클래스 — 강의 랜딩 페이지

Canva와 AI 도구로 콘텐츠를 만드는 강의를 소개·모집하는 1페이지 랜딩입니다.
순수 HTML/CSS/JS, 빌드 불필요. 밝고 크리에이티브한 보라/시안 그라데이션 테마.

## 구성
| 파일 | 설명 |
|------|------|
| `index.html` | 히어로 → 결과물 칩 → 왜 캔바+AI(벤토) → 4주 커리큘럼 → 수강 대상 → 수강료 플랜 → FAQ → 신청 폼/CTA → 푸터 |
| `styles.css` | 보라·핑크·시안 그라데이션 테마. 색은 상단 `:root`에서 변경 |
| `script.js` | 내비 효과, FAQ 아코디언, 신청 폼 처리 |

## 내 것으로 바꾸기 (✏️ 표시 부분)
- **강의명/강사명/문구**: `index.html` 텍스트 직접 수정
- **커리큘럼·기간**: `WEEK 1~4` 내용 수정 (주차 수도 자유롭게)
- **수강료**: `#price` 섹션의 플랜·금액 수정 (현재 금액은 예시)
- **수치(수강생·만족도)**: 히어로의 `hero-stats` 값 교체
- **색상**: `styles.css` 상단 `:root`의 `--brand`, `--grad` 등

## 신청 폼 실제 접수
`script.js`의 `// TODO` 참고:
- 가장 쉬움: [Formspree](https://formspree.io) → `<form>`에 `action`/`method` 추가
- 또는 구글 폼 링크 연결 / Google Apps Script로 스프레드시트 기록 / 카카오 채널

## 실행
```bash
python3 -m http.server 8000   # http://localhost:8000/canva-ai/
```
