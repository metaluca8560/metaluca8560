# Firebase 앱 — 소스는 여기 없습니다

`vaulted-bus-346411.web.app`에 올라간 앱들의 **원본은 다른 저장소에 있습니다.**

```
metaluca27/huhsame-script  →  landing/
```

한때 이 폴더에 배포본을 받아 두었지만, 원본 저장소를 찾아 백업한 뒤로는
사본이 둘이 되어 오히려 헷갈리므로 지웠습니다. 고칠 일이 있으면 위 저장소를 보세요.

## 어떤 앱이 있나

| 경로 | 앱 | 쓰는 백엔드 |
|------|-----|-------------|
| `/` | 루카의 디지털 다락방 (포털) | 없음 |
| `/scan` | my scan2677 — 사진 속 글자를 텍스트로 | `/scan` |
| `/talk` | 마주톡 — 여행 실시간 대화 번역기 | `/translate` |
| `/voice` | 킬링보이스 — 내 대본, 여덟 목소리 | `/voice/tts` `/voice/stt` |
| `/look` | 나좀봐 — 대화를 눈과 목소리로 | `/voice/tts` |
| `/tarot` | 심연의 타로 | 없음 (아래 참고) |
| `/byeol` | 곁별 | 미확인 |
| `/cards` | 다락방 짝꿍 찾기 | 미확인 |
| `/game` | 리버스 스와이프 — 나의 냥이봇들 | 미확인 |

백엔드는 모두 공용 Worker `small-recipe-9345`입니다 (소스: 이 저장소의 `shared-api/`).
즉 **프론트와 백엔드가 서로 다른 저장소에 있습니다.** 백엔드를 고칠 때는 여기,
화면을 고칠 때는 `huhsame-script`입니다.

`/byeol` `/cards` `/game`은 포털에 링크가 없어 뒤늦게 발견했습니다. 백엔드를 쓰는지는
아직 확인하지 않았습니다.

## 타로만 예외입니다

Firebase의 `landing/tarot/index.html`은 껍데기이고, 실제 코드는 **이 저장소의**
`tarot/` 폴더를 부릅니다.

```html
<link href="/tarot/styles.css">
<script src="/tarot/app.js">
<script src="/tarot/cards-data.js">
```

타로를 고칠 때는 이 저장소의 `tarot/`를 고치세요.

## 배포

Firebase는 **수동 배포**입니다. `huhsame-script`에 `firebase.json`과 `.firebaserc`가
있으므로 그 폴더에서 `firebase deploy`를 실행합니다. 푸시만으로는 반영되지 않습니다.
