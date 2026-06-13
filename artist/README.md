# ATELIER — 작가 포트폴리오 (에디토리얼 디자인)

회화·드로잉·일러스트 작가를 위한 1페이지 포트폴리오. 매거진/전시 도록 같은
에디토리얼 무드 — 먹빛 배경 + 크림 반전 섹션, 명조체 대형 타이포, 마퀴,
비대칭 갤러리, 커스텀 커서, 스크롤 등장 연출. 순수 HTML/CSS/JS, 빌드 불필요.

## 구성
| 파일 | 설명 |
|------|------|
| `index.html` | 히어로 → 마퀴 → 비대칭 작품 갤러리 → 소개(크림 반전) → 전시·커미션 인덱스 → 대형 메일 링크 + 문의 폼 → 푸터 |
| `styles.css` | 에디토리얼 다크 테마. 색·폰트는 상단 `:root`에서 변경 |
| `script.js` | 커스텀 커서, 스크롤 등장(IntersectionObserver), 문의 폼 처리 |

## 디자인 특징
- **타이포**: 한글 명조(Nanum Myeongjo) 대형 헤드라인 + 모노(Space Mono) 라벨 + Pretendard 본문
- **커스텀 커서**: 마우스 환경에서 `data-cursor` 요소 위에 "VIEW" 라벨로 확대 (모바일/터치는 자동 비활성)
- **마퀴 / 그레인 / 크림 반전 섹션 / 메일 아웃라인 호버** 등 감각적 디테일
- 접근성: `prefers-reduced-motion` 존중, 터치 기기 커서 숨김

## 내 것으로 바꾸기 (✏️ 표시 부분)
- **작가명/소개**: `index.html` 텍스트 직접 수정 (`ATELIER`, 작품 제목, 전시 이력)
- **작품 이미지**: `artist/img/`에 사진을 넣고 각 `.art` 배경을
  `style="background-image:url('img/work1.jpg')"` 로 교체 (현재는 CSS 그라데이션 자리표시).
  카드 비율은 `.work-media`에 `wide`/`tall` 클래스로 조절
- **이메일/SNS**: 연락 섹션의 `mailto:`, 소셜 `<a href="#">` 교체
- **색상/폰트**: `styles.css` 상단 `:root` (`--accent` 버밀리언 등)

## 문의 폼 실제 전송
`script.js`의 `// TODO` 참고 — 가장 쉬운 방법은 [Formspree](https://formspree.io)
폼을 만들어 `<form>`에 `action`/`method`를 추가하는 것입니다.

## 실행
```bash
python3 -m http.server 8000   # http://localhost:8000/artist/
```
