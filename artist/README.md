# ATELIER — 작가 포트폴리오 사이트

회화·드로잉·일러스트 작가를 위한 1페이지 포트폴리오입니다. 순수 HTML/CSS/JS, 빌드 불필요.

## 구성
| 파일 | 설명 |
|------|------|
| `index.html` | 히어로 → 작품 갤러리(필터) → 소개 → 전시 이력 → 커미션 안내 → 문의 폼 → 푸터 |
| `styles.css` | 차분한 갤러리 테마(미색 종이 + 테라코타 포인트). 색은 상단 `:root`에서 변경 |
| `script.js` | 내비 효과, 작품 분류 필터, 문의 폼 처리 |

## 내 것으로 바꾸기 (✏️ 표시 부분)
- **작가명/소개**: `index.html`의 텍스트 직접 수정 (`ATELIER`, 작품 제목, 전시 이력 등)
- **작품 이미지**: `artist/img/` 폴더에 사진을 넣고, 각 `.art` 의 배경을
  `style="background-image:url('img/work1.jpg')"` 형태로 교체 (현재는 CSS 그라데이션 자리표시)
- **SNS/이메일 링크**: 문의 섹션의 `<a href="#">`, `mailto:` 교체
- **색상**: `styles.css` 상단 `:root`의 `--accent` 등

## 문의 폼 실제 전송
`script.js`의 `// TODO` 참고 — 가장 쉬운 방법은 [Formspree](https://formspree.io)
폼을 만들어 `<form>`에 `action`/`method`를 추가하는 것입니다.

## 실행
```bash
python3 -m http.server 8000   # http://localhost:8000/artist/
```
