# AI 글쓰기 스킬 세트

"You sound like AI" 이미지에서 출발한 프로젝트. 원본의 12개 스킬 목록은 중복이 많아서(humanizer 2회, ban-the-X 계열 4종 등) 실제로 역할이 다른 **4개**로 정리했다.

## 스킬 구성

| 스킬 | 역할 | 이럴 때 |
|---|---|---|
| `/humanizer` | AI 티 나는 글을 다듬어서 돌려줌 | 이미 쓴 글을 자연스럽게 만들고 싶을 때 |
| `/red-pen` | 고치지 않고 약한 문장만 지적 + 5항목 50점 점수표 | 내 손으로 고치고 싶을 때, 피드백만 필요할 때 |
| `/sound-like-me` | 내 글 샘플로 문체 프로필 생성 → 그 목소리로 작성. 녹음 받아쓰기를 주면 내 말을 잘라 글로 만드는 받아쓰기 모드 | "내가 쓴 것처럼" 써야 할 때, 말로 먼저 풀어놨을 때 |
| `/writer` | 처음부터 사람 습관으로 쓰고 셀프 검수까지 | 새 글을 쓸 때 |

원본 이미지의 `/ban-the-AI-words`, `/ban-the-AI-patterns`, `/auto-block-banned-words`, `/anti-AI style`, `/self-critique` 기능은 별도 스킬이 아니라 **humanizer의 패턴 사전 + writer의 셀프 검수 단계**로 흡수했다. `/fact-checker`와 `/editor`는 이 세트의 범위(AI 티 제거) 밖이라 제외.

## 공유 자원

AI 티 판별 기준은 `humanizer/references/`에 한 곳만 둔다:

- `ai-isms-ko.md` — 한국어 패턴 (번역투, 명사화 조언, 부정 대구법 등)
- `ai-isms-en.md` — 영어 패턴 (delve/robust 류, adverb abuse 등)

red-pen과 writer도 이 파일을 참조한다. 패턴을 추가하고 싶으면 이 두 파일만 고치면 전체 스킬에 반영된다.

## 기존 스킬과의 관계

insta-shortform, local-news-article, weekly-report 같은 콘텐츠 생성 스킬의 결과물을 발행 전에 `/humanizer`로 한 번 거르는 조합을 권장. 단, 받아쓰기 모드 결과물은 humanizer를 거치지 않는다(필요하면 red-pen으로 짚기만).

## 참고한 외부 스킬

- red-pen 점수표: [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)(MIT)의 5항목 채점 방식을 한국어 글에 맞게 옮김. 영어 전용 규칙(부사·수동태·em dash 전면 금지)은 가져오지 않음.
- 받아쓰기 모드: [charlie947/voiceprint](https://github.com/charlie947/voiceprint)(MIT)의 "본인 문장을 85% 이상 남긴다"는 접근을 참고.
  - 원본 `bin/trace.py`는 영어 단어만 세서 한국어에서는 동작하지 않는다. 그래서 글자 2개 단위로 비교하는 `sound-like-me/scripts/trace_ko.py`를 새로 만들었다.
  - `scripts/test_trace_ko.py`: 정답을 아는 25문장으로 점검. 내 말/새로 쓴 문장 구분 25/25. 단, 예제는 직접 만든 것이라 실제 녹음으로 추가 확인이 필요하다.
  - 85% 기준은 원작자가 영어 글 1편, 탐지기 1개(Pangram)로 잰 값이다. 한국어 AI 탐지 결과와의 관계는 확인되지 않았다.

## 외부 설치 스킬

| 스킬 | 역할 | 출처 |
|---|---|---|
| `/frontend-slides` | HTML 한 파일짜리 발표 자료 제작, PPT → 웹 변환, PDF 내보내기, Vercel 배포 | [zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides) (MIT), 커밋 `9906a34` 복사. `KOREAN.md`(한국어 규칙)와 `scripts/check-ko.mjs`(한국어 캡처 확인)를 추가하고, SKILL.md에는 KOREAN.md를 읽으라는 줄 하나만 넣음 |

- Vercel 배포(`scripts/deploy.sh`)는 공개 URL을 만든다. 스킬이 배포 전에 물어보게 되어 있지만, 내부 자료는 배포 대신 PDF로 받는 게 안전하다.
- PDF 내보내기와 PPT 변환은 각각 Node.js(playwright), Python(python-pptx)이 필요하다.
- 업데이트하려면 원본 저장소에서 같은 파일을 다시 복사한다.

## 사용 예

```
/humanizer 아래 글 다듬어줘: (글 붙여넣기)
/red-pen 이 블로그 초안 첨삭해줘
/sound-like-me 내 인스타 캡션 3개 줄게, 문체 분석해줘
/sound-like-me 음성 메모 받아쓴 거야, 이걸로 블로그 글 만들어줘
/writer 냥이동 서비스 소개글 500자로 써줘
/frontend-slides 이번 주간보고로 발표 슬라이드 만들어줘
```
