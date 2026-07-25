# AI 글쓰기 스킬 세트

"You sound like AI" 이미지에서 출발한 프로젝트. 원본의 12개 스킬 목록은 중복이 많아서(humanizer 2회, ban-the-X 계열 4종 등) 실제로 역할이 다른 **4개**로 정리했다.

## 스킬 구성

| 스킬 | 역할 | 이럴 때 |
|---|---|---|
| `/humanizer` | AI 티 나는 글을 다듬어서 돌려줌 | 이미 쓴 글을 자연스럽게 만들고 싶을 때 |
| `/red-pen` | 고치지 않고 약한 문장만 지적 | 내 손으로 고치고 싶을 때, 피드백만 필요할 때 |
| `/sound-like-me` | 내 글 샘플로 문체 프로필 생성 → 그 목소리로 작성 | "내가 쓴 것처럼" 써야 할 때 |
| `/writer` | 처음부터 사람 습관으로 쓰고 셀프 검수까지 | 새 글을 쓸 때 |

원본 이미지의 `/ban-the-AI-words`, `/ban-the-AI-patterns`, `/auto-block-banned-words`, `/anti-AI style`, `/self-critique` 기능은 별도 스킬이 아니라 **humanizer의 패턴 사전 + writer의 셀프 검수 단계**로 흡수했다. `/fact-checker`와 `/editor`는 이 세트의 범위(AI 티 제거) 밖이라 제외.

## 공유 자원

AI 티 판별 기준은 `humanizer/references/`에 한 곳만 둔다:

- `ai-isms-ko.md` — 한국어 패턴 (번역투, 명사화 조언, 부정 대구법 등)
- `ai-isms-en.md` — 영어 패턴 (delve/robust 류, adverb abuse 등)

red-pen과 writer도 이 파일을 참조한다. 패턴을 추가하고 싶으면 이 두 파일만 고치면 전체 스킬에 반영된다.

## 기존 스킬과의 관계

insta-shortform, local-news-article, weekly-report 같은 콘텐츠 생성 스킬의 결과물을 발행 전에 `/humanizer`로 한 번 거르는 조합을 권장.

## 사용 예

```
/humanizer 아래 글 다듬어줘: (글 붙여넣기)
/red-pen 이 블로그 초안 첨삭해줘
/sound-like-me 내 인스타 캡션 3개 줄게, 문체 분석해줘
/writer 냥이동 서비스 소개글 500자로 써줘
```
