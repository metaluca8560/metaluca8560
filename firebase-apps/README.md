# Firebase 배포본 (`vaulted-bus-346411.web.app`)

이 폴더의 HTML은 **배포된 페이지를 그대로 내려받아 보존한 것**입니다.

원본 소스가 저장소에도 로컬 PC에도 없었습니다. 이 앱들은 배포본만 존재하는 상태로
돌아가고 있었고, Firebase 프로젝트에 문제가 생기면 복구할 방법이 없었습니다.
공개된 페이지를 받아 여기 넣었습니다. 손대지 않은 원본이라 지금 서비스 중인 것과
동일합니다.

## 페이지

| 파일 | 앱 | 쓰는 백엔드 |
|------|-----|-------------|
| `root.html` | 루카의 디지털 다락방 (이 사이트의 포털) | 없음 |
| `scan.html` | my scan2677 — 사진 속 글자를 텍스트로 | `/scan` |
| `talk.html` | 마주톡 — 여행 실시간 대화 번역기 | `/translate` |
| `voice.html` | 킬링보이스 — 내 대본, 여덟 목소리 | `/voice/tts` `/voice/stt` |
| `look.html` | 나좀봐 — 대화를 눈과 목소리로 | `/voice/tts` |
| `tarot.html` | 심연의 타로 | 없음 (아래 참고) |

백엔드는 모두 공용 Worker `small-recipe-9345`입니다 (소스: `shared-api/`).

`root.html`을 뺀 나머지는 **자기완결형 단일 파일**입니다. 외부 JS·CSS 의존이 없어서
파일 하나만 있으면 그 앱이 온전합니다.

## tarot.html은 껍데기입니다

실제 코드는 저장소의 `tarot/` 폴더에 있습니다.

```html
<link href="/tarot/styles.css">
<script src="/tarot/app.js">
<script src="/tarot/cards-data.js">
```

타로를 고칠 때는 `tarot/` 폴더를 고치세요. 이 파일이 아닙니다.

## 아직 안 받은 것

`root.html`이 부르는 이미지 3개입니다. 포털을 실제로 고칠 일이 생기면 그때 받으면 됩니다.

```
images/class.jpg  images/intro.png  images/mascot.png
```

## 배포

Firebase 배포는 **수동**이며 자동화되어 있지 않습니다. 이 저장소에 `firebase.json`이
없어서, 배포 설정이 어디에 있는지는 아직 확인하지 못했습니다. 수정 후 반영하려면
Firebase 콘솔이나 `firebase deploy`를 쓰던 환경을 먼저 찾아야 합니다.

주의: 여기 파일을 고쳐도 **Firebase에 올리기 전까지는 서비스에 반영되지 않습니다.**
Netlify·Vercel처럼 푸시하면 자동 배포되는 구조가 아닙니다.
