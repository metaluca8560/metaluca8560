# 울주 AI 영상 부문 제작 킷 — 「돌에서 나온 고래」

> 대상 공모: 2026「울주에 숏며들다」숏폼 영상 공모전(가을·AI편) · AI 영상 부문
> 툴 스택: **Midjourney v7 (이미지) → Kling 2.x (이미지-투-비디오)**
> 업로드: **인스타그램 릴스**
> 요건 근거: 울주군 공고 제2026-2364호

---

## 0. 먼저 — 기존 계정 분석과 스펙 갭

### 확인한 것 (업로드해주신 영상 2편)
| 항목 | 현재 |
|---|---|
| 해상도 | **404×720** |
| 길이 | **5.04초** |
| 프레임 | 24fps, H.264 |
| 포맷 | 단일 컷, 컷 전환 없음 |
| 스타일 | 실사풍 항공 앵글 + 실제 랜드마크가 거대 생물로 변형 |

영상 1 = 반구대 암각화 절벽에서 혹등고래 떼가 튀어나와 대곡천으로 뛰어듦, 전망대 관광객이 올려다봄.
영상 2 = 해안 암반이 용머리로 변하고 입에서 폭포가 쏟아짐, 눈에 주황 발광.

### ⚠️ 스펙 갭 3가지 — 이것부터 해결

**1. 해상도가 규격 미달이다**
공고 요건은 **1080×1920**이다. 받은 파일은 404×720 — 인스타에서 다시 받은 압축본으로 보인다.
→ **Kling 원본 마스터(1080p 이상)가 남아 있는지 확인할 것.** 제출물에 "숏폼 원본 영상 파일"이 포함되고, 심사 중 원본·제작 증빙을 추가로 요구할 수 있다(공고 명시). 인스타 재다운로드본을 제출하면 안 된다.

**2. 5초 콘텐츠와 15~60초 콘텐츠는 다른 물건이다**
지금 만드는 건 "한 컷 스펙터클"이다. 임팩트는 강하지만 5초다. 공모전은 최소 15초, 본심 배점에 **기획·전달력 10점**이 따로 있다. 컷을 이어 붙이는 순간 서사가 필요해진다. 이 킷의 핵심이 그 부분이다.

**3. 이미 올린 영상을 다시 쓰지 말 것**
공고상 필수 해시태그 3종을 달아 접수기간에 새로 업로드해야 하고, 정량지표도 그 게시물 기준으로 집계된다. 기존 게시물 재활용은 리스크만 크다. **새로 만들어 10월 1일에 올린다.**

### 반대로, 계정은 강력한 자산이다
예비심사의 절반이 `조회수 + (좋아요×10)`이다. **매일 올리는 계정이 있다는 건 이 공모전에서 가장 큰 무기다.** 신규 계정 참가자는 이 지표에서 시작부터 진다. 아래 8절에 이 자산을 쓰는 법을 따로 정리했다.

---

## 1. 컨셉 — 왜 다시 고래인가, 그리고 뭐가 달라지는가

### 고래를 버리지 않는 이유 (심사에 직결)
- **반구천의 암각화는 작년 유네스코 세계유산에 등재됐고, 지금이 등재 1주년이다.** 울주군이 가장 밀고 있는 소재다 → 본심 **공공 활용성 10점**, **주제 적합성 10점**에 정면으로 맞는다.
- 2026. 9. 15. 뉴스: **"고래뼈에 박힌 사슴뿔 작살촉"이 국가유산으로 지정**됐다. 암각화 속 고래가 상상이 아니라 실제 선사시대 포경의 기록이었다는 실물 근거다. 훅 문구가 여기서 나온다.
- 이미 그 그림을 만들어본 경험이 있다 = 프롬프트 리스크가 가장 낮다.

> ※ 위 두 사실은 2026년 9월 기준 국내 언론 보도로 확인했다. 인용 문구를 영상 자막에 넣을 거라면 울주군 홍보팀에 한 번 더 확인하는 걸 권한다.

### 기존 영상과 달라지는 지점 — **고래가 변한다**

지금 영상의 고래는 처음부터 끝까지 살아있는 혹등고래다. 이번 영상의 고래는 **돌에서 시작해 생명으로 바뀐다.**

| 구간 | 고래의 상태 |
|---|---|
| 컷 1~2 | **완전한 암각화** — 화강암 질감, 선각만 파인 형태, 무생물 |
| 컷 3~5 | **전이 상태** — 파인 홈에서 호박빛이 새어나오고, 돌 표면이 조금씩 고래 피부로 |
| 컷 6~8 | **완전한 생명체** — 살아있는 고래, 물보라와 숨결 |
| 컷 9 | **빛으로 환원** — 흩어져 '울주' 글자가 됨 |

5초짜리로는 절대 못 하는 것이 이것이다. **변화는 시간이 있어야 보인다.** 45초를 쓰는 이유가 생기고, 심사위원에게 "왜 숏폼이 아니라 이 길이인가"에 대한 답이 된다.

---

## 2. 컷 구성 (9컷 × 5초 = 45초)

Kling 기본 출력이 5초라 컷당 5초로 맞췄다. 재생성 없이 그대로 이어붙일 수 있다.

| # | 장소 | 그림 | 고래 상태 | 자막 |
|---|---|---|---|---|
| 1 | 반구천 암각화 절벽 | 바위 표면 클로즈업, 선각 고래가 미세하게 꿈틀 | 암각화 | *(없음 — 침묵)* |
| 2 | 반구천 암각화 절벽 | 고래가 바위를 뚫고 나옴, 돌가루 쏟아짐 | 암각화 | `7천 년 만에` |
| 3 | 대곡천 | 물길 위를 낮게 헤엄침, 전망대의 사람들이 올려다봄 | 전이 시작 | `반구천의 고래가` |
| 4 | 간월재 억새평원 | 억새 위를 스치듯 지나감, 지나간 자리가 금빛 | 전이 중 | `깨어났다` |
| 5 | 신불산 운해 | 구름바다를 뚫고 상승 | 전이 후반 | *(없음)* |
| 6 | 외고산 옹기마을 | 항아리들이 하나씩 불을 켬, 불빛이 날아오름 | 생명체 | `울주를 지나` |
| 7 | 석남사 단풍길 | 단풍 터널 위, 낙엽이 소용돌이치며 따라감 | 생명체 | *(없음)* |
| 8 | 간절곶 등대 | 일출 수평선을 향해 나아감, 등대를 돌아 | 생명체 | `가장 먼저 해가 뜨는 곳으로` |
| 9 | 울주 전경 | 고래가 빛으로 흩어져 `울주` 글자를 이룸 | 빛 | `울주` → CTA |

**30초 축소판이 필요하면**: 1, 2, 3, 4, 6, 8, 9 (7컷 × 약 4.3초). 컷 5(운해)와 7(석남사)을 뺀다. 다만 정량지표상 길이가 불리하진 않으므로 45초 권장.

---

## 3. 고래 캐릭터 시트 — 일관성 고정 블록

Midjourney v7에서 9컷의 고래를 같은 개체로 보이게 하는 게 이 작업의 최대 난관이다. 방법은 두 가지를 같이 쓴다.

**(a) 고정 묘사 블록** — 모든 프롬프트에 그대로 복붙한다. 단어를 바꾸지 말 것.

```
a colossal humpback whale, 40 meters long, its entire body surfaced in weathered grey granite carved with prehistoric petroglyph line-art of whales and hunting boats, deep chiselled grooves glowing with warm amber light from within, wet stone sheen, barnacle-like rock texture along the jaw, long pectoral fins
```

**(b) 스타일 레퍼런스 체인** — 컷 1을 먼저 뽑아 마음에 드는 이미지를 확정한 뒤, 그 이미지 URL을 컷 2~9 프롬프트 맨 앞에 붙인다.

```
[컷1 이미지 URL] [프롬프트 본문] --ar 9:16 --v 7 --style raw --sref [컷1 이미지 URL] --sw 120
```

**전이 상태 조절** — 위 고정 블록에서 한 구절만 바꿔 단계를 만든다.

| 컷 | 고정 블록에서 교체할 부분 |
|---|---|
| 1~2 | 그대로 (완전 석재) |
| 3~4 | `surfaced in weathered grey granite` → `half granite half living whale skin, the stone dissolving into dark wet flesh from the tail forward` |
| 5 | `half granite` → `mostly living whale skin with only faint petroglyph scars remaining` |
| 6~8 | `surfaced in weathered grey granite carved with...` → `dark slate-blue living whale skin with faint luminous petroglyph scars still glowing along its flank` |
| 9 | `→ dissolving into thousands of drifting amber light particles` |

---

## 4. Midjourney 프롬프트 (컷별 · 그대로 붙여넣기)

모든 컷 공통 접미: `--ar 9:16 --v 7 --style raw --q 2`
컷 2부터는 여기에 `--sref [컷1 확정 이미지 URL] --sw 120`을 덧붙인다.

### 컷 1 — 암각화 절벽 클로즈업
```
extreme close-up of an ancient riverside rock cliff face in Korea, weathered grey granite covered in prehistoric petroglyph carvings of whales, boats and hunters, deep chiselled grooves faintly glowing with warm amber light, morning mist, dew on stone, shallow depth of field, cinematic photorealistic, muted earth tones, soft directional dawn light --ar 9:16 --v 7 --style raw --q 2
```

### 컷 2 — 고래가 바위를 뚫고 나옴
```
a colossal humpback whale, 40 meters long, its entire body surfaced in weathered grey granite carved with prehistoric petroglyph line-art of whales and hunting boats, deep chiselled grooves glowing with warm amber light from within, wet stone sheen, barnacle-like rock texture along the jaw, long pectoral fins, bursting head-first out of a towering riverside cliff face, shattered rock fragments and dust cascading down, a narrow green river below, dense Korean forest, dramatic scale, aerial cinematic photography, photorealistic --ar 9:16 --v 7 --style raw --q 2
```

### 컷 3 — 대곡천 물길, 전망대의 사람들
```
a colossal humpback whale, 40 meters long, half granite half living whale skin, the stone dissolving into dark wet flesh from the tail forward, deep chiselled petroglyph grooves glowing with warm amber light from within, long pectoral fins, gliding low above a narrow emerald river between limestone cliffs, a small wooden observation deck below with a dozen tiny tourists in colourful jackets looking up in awe, autumn forest, aerial cinematic photography, photorealistic, sense of immense scale --ar 9:16 --v 7 --style raw --q 2
```

### 컷 4 — 간월재 억새평원
```
a colossal humpback whale, 40 meters long, half granite half living whale skin, the stone dissolving into dark wet flesh from the tail forward, petroglyph grooves glowing warm amber, long pectoral fins, skimming just above a vast silver pampas grass plateau on a Korean mountain ridge at golden hour, the grass turning luminous gold in a wave where the whale passes, layered blue mountain ridgelines behind, low sun flare, aerial cinematic photography, photorealistic --ar 9:16 --v 7 --style raw --q 2
```

### 컷 5 — 신불산 운해 돌파
```
a colossal humpback whale, 40 meters long, mostly living whale skin with only faint petroglyph scars remaining glowing amber, long pectoral fins, rising vertically through a dense sea of clouds above Korean mountain peaks at dawn, cloud vortices trailing from its fins, warm sunrise light breaking above the cloud layer, aerial cinematic photography, photorealistic, epic scale --ar 9:16 --v 7 --style raw --q 2
```

### 컷 6 — 외고산 옹기마을
```
a colossal humpback whale, 40 meters long, dark slate-blue living whale skin with faint luminous petroglyph scars still glowing along its flank, long pectoral fins, gliding above a traditional Korean pottery village at dusk, hundreds of large dark earthenware onggi jars arranged in rows across terraced yards, each jar lighting up one by one with warm amber glow as the whale passes, tiny golden lights rising from the jar mouths into the air, tiled roofs, blue hour sky, aerial cinematic photography, photorealistic --ar 9:16 --v 7 --style raw --q 2
```

### 컷 7 — 석남사 단풍길
```
a colossal humpback whale, 40 meters long, dark slate-blue living whale skin with faint luminous petroglyph scars glowing along its flank, long pectoral fins, gliding low above a winding mountain road tunnelled by brilliant red and orange autumn maple trees, a traditional Korean temple gate visible below, swirling vortex of fallen leaves spiralling up in the whale's wake, soft afternoon backlight, aerial cinematic photography, photorealistic --ar 9:16 --v 7 --style raw --q 2
```

### 컷 8 — 간절곶 일출
```
a colossal humpback whale, 40 meters long, dark slate-blue living whale skin with faint luminous petroglyph scars glowing along its flank, long pectoral fins, arcing around a tall white coastal lighthouse on a grassy headland and heading out toward a blazing sunrise on the open sea horizon, golden light path across the water, low clouds, silhouette rim light on the whale, aerial cinematic photography, photorealistic, hopeful epic mood --ar 9:16 --v 7 --style raw --q 2
```

### 컷 9 — 빛으로 환원
```
a colossal humpback whale dissolving into thousands of drifting amber light particles high above a wide Korean landscape of mountains, river and coastline at dawn, the particles drifting and beginning to gather into a luminous shape in the sky, deep blue pre-dawn atmosphere, warm particle glow, aerial cinematic photography, photorealistic, serene and grand --ar 9:16 --v 7 --style raw --q 2
```

> 컷 9의 `울주` 글자는 AI로 만들지 말 것. 한글은 이미지 생성 모델이 거의 확실히 뭉갠다. **입자만 생성하고 글자는 편집 단계에서 타이포로 얹는다.**

---

## 5. Kling 모션 프롬프트 (컷별)

각 컷의 Midjourney 결과 이미지를 Kling 이미지-투-비디오에 넣고 아래를 붙인다. 모든 컷 공통 네거티브:

```
negative: morphing, warping, distorted anatomy, extra fins, flickering, text, watermark, people's faces, jitter, sudden cuts
```

| # | 모션 프롬프트 |
|---|---|
| 1 | `The carved whale in the rock surface shifts almost imperceptibly, the glowing grooves pulsing once like a slow heartbeat. Camera pushes in very slowly. Dust motes drift in the air.` |
| 2 | `The stone whale bursts forward out of the cliff face toward the camera, rock fragments and dust exploding outward and falling. Camera pulls back rapidly to reveal the full scale of the cliff.` |
| 3 | `The whale glides forward smoothly above the river from right to left, its body slowly rippling. Camera tracks alongside it. The tiny people on the deck below turn their heads to follow it.` |
| 4 | `The whale skims forward just above the pampas grass, the grass bending and turning gold in a spreading wave beneath it. Camera follows from behind and slightly above. Grass sways in wind.` |
| 5 | `The whale rises vertically through the cloud layer, clouds parting and swirling around its fins. Camera tilts up following the ascent. Sunlight grows brighter as it breaks through.` |
| 6 | `The whale glides slowly over the pottery village. The jars light up in sequence beneath it, warm sparks rising upward. Camera moves forward slowly at low altitude.` |
| 7 | `The whale glides over the maple tunnel. Fallen leaves lift and spiral upward in its wake. Camera follows from behind, descending slightly toward the road.` |
| 8 | `The whale banks gracefully around the lighthouse and heads toward the sunrise on the horizon, growing smaller. Camera holds steady and slowly pushes in. Waves move below.` |
| 9 | `The whale dissolves into countless drifting amber particles that float upward and slowly begin to converge. Camera holds steady, very slow push in. Particles drift gently.` |

**작업 순서 팁**: 컷 2, 6, 9가 가장 실패율이 높다(폭발·연쇄 발광·입자 해체). 이 셋을 먼저 돌려서 되는지 확인한 뒤 나머지를 생성할 것. 안 되면 컷 2는 "이미 튀어나온 상태"의 이미지로 시작해 카메라 풀백만 주는 식으로 난이도를 낮춘다.

---

## 6. 편집 스펙

| 항목 | 값 |
|---|---|
| 출력 | **1920×1080이 아니라 1080×1920** · MP4(H.264) · 24 또는 30fps |
| 길이 | 45초 (15~60초 범위 내) |
| 컷 전환 | 하드컷 금지. 컷마다 고래의 진행 방향을 맞추고 0.3초 디졸브 또는 화이트 플래시 |
| 자막 위치 | **화면 상단 15%·하단 25%를 비울 것** — 인스타 UI와 군청 재업로드 시 잘림 방지. 본심 "공공 활용성 10점"이 여기서 갈린다 |
| 자막 서체 | 굵은 고딕 계열, 흰색 + 약한 그림자. 밈체·유행어 금지(군청 톤과 안 맞으면 감점) |
| 워터마크 | **넣지 말 것.** 개인 계정 로고가 박히면 군청이 못 쓴다 |
| 음원 | 상업적 이용 가능한 무료 음원만. 인스타 제공 인기 음원은 **원본 파일 제출 시 라이선스 문제가 된다** |
| 사운드 디자인 | 0~3초 무음 → 컷 2에서 저음 임팩트 한 번 → 이후 현악 크레셴도. 고래 울음소리는 저작권 프리 소스만 |

---

## 7. 훅과 CTA — 좋아요 1개 = 조회수 10회

### 0~3초 훅 (여기서 다 결정된다)
컷 1을 **무음 + 자막 없이** 1.5초 버틴 뒤, 컷 2 임팩트와 동시에 자막을 때린다. 첫 화면에 텍스트를 도배하지 않는 게 이 영상의 승부수다 — 바위가 꿈틀거리는 그림 자체가 훅이다.

자막 후보 (컷 2 시점):
- A) `7천 년 만에` → 컷 3 `반구천의 고래가` → 컷 4 `깨어났다` **(권장 — 세 컷에 걸쳐 완성되는 한 문장이라 끝까지 보게 된다)**
- B) `이 고래는 상상이 아니었다`
- C) `작년 세계유산이 된 그림이 움직이기 시작했다`

### 마지막 5초 CTA — 좋아요를 1순위로
```
(컷 9, 울주 타이포 등장 후)

자막 1:  울주 · 반구천의 암각화
자막 2:  세계유산 등재 1주년
자막 3:  고래가 계속 헤엄치길 바라면 ❤️
```

**저장·팔로우보다 좋아요를 먼저, 명시적으로 요청한다.** 지표가 `조회수 + (좋아요×10)`이기 때문이다. 댓글 유도는 캡션에서 따로 한다.

### 캡션 (릴스 본문)
```
7천 년 전 반구천 바위에 새겨진 고래.
작년 유네스코 세계유산이 됐고,
며칠 전엔 그 고래를 실제로 잡았다는 증거까지 국가유산이 됐습니다.

상상이 아니었던 겁니다.

그래서 한 번 꺼내봤습니다. AI로.

📍 반구천 암각화 · 간월재 · 옹기마을 · 석남사 · 간절곶 (전부 울산 울주)
어디부터 가보고 싶으세요? 댓글로 알려주세요

#울주에숏며들다AI편 #울주AI #울주군
#반구천의암각화 #세계유산 #울주여행 #영남알프스 #간절곶 #AI영상 #생성형AI
```

> 필수 해시태그 3종(`#울주에숏며들다AI편` `#울주AI` `#울주군`)은 **반드시 전부** 들어가야 한다. 누락 시 접수 자체가 무효다.

---

## 8. 인스타 릴스 운영 — 이미 가진 무기 쓰기

매일 올리는 계정이 있다는 게 이 공모전에서 가장 큰 이점이다. 다만 공고 조작 금지 조항(매크로·계정 구매·유료 프로모션 → 수상 취소 및 전액 환수)에 걸리지 않는 정공법만 쓴다.

**10/1 업로드가 결정적이다.** 정량지표 집계는 11/20 이후다. 10월 1일에 올리면 7주, 11월 초에 올리면 2~3주다. 다른 참가자 대부분은 마감에 몰린다.

1. **9월 말까지 빌드업**: 본편 올리기 전 2~3일간 기존 계정에 "돌에서 나온 고래" 티저 컷(컷 1 또는 컷 2만 5초)을 평소처럼 올려둔다. 알고리즘에 주제를 학습시키고 기대감을 만든다.
2. **10/1 본편 업로드 + 당일 서류 제출**. 미루지 않는다.
3. **업로드 직후 3시간이 릴스 도달의 분수령이다.** 그 시간대에 댓글에 직접 답을 달아 참여 신호를 올린다.
4. **본계정·다른 채널에서 릴스를 공유**한다. 스토리 공유는 조작이 아니라 정상적인 확산이다.
5. 10월 내내 계정의 다른 게시물에서 자연스럽게 언급한다. 다만 "좋아요 눌러달라"는 노골적 품앗이·이벤트성 유도는 피한다 — 공고의 "왜곡" 판단 여지를 남기지 않는다.
6. **12월 10일 결과발표일까지 게시물을 전체공개로 유지한다.** 중간에 내리거나 비공개 전환하면 심사 제외다.

---

## 9. 제출 체크리스트 (AI 부문)

- [ ] **1080×1920** MP4 또는 MOV, **15~60초** (현재 파이프라인 404×720 → 마스터 확인 필수)
- [ ] 2025. 1. 1. 이후 제작한 신규 창작물 (기존 게시물 재활용 아님)
- [ ] 인스타그램 릴스에 **전체공개** 업로드
- [ ] 필수 해시태그 3종 전부: `#울주에숏며들다AI편` `#울주AI` `#울주군`
- [ ] 워터마크·개인 로고 없음, 자막 안전영역 확보
- [ ] **서식 1** 참가신청서 — 부문 `AI편` 체크 + **사용 AI 프로그램란에 Midjourney, Kling 명시**
- [ ] **서식 2** 개인정보 동의서 + 저작물 이용 동의서 (2장 모두 서명)
- [ ] **Midjourney·Kling 유료 플랜의 상업적 이용 라이선스 확인** (공고 명시 요건)
- [ ] 생성 원본·프롬프트 기록 보관 (심사 중 제작 증빙 추가 요구 가능)
- [ ] 음원 라이선스 확인
- [ ] 이메일 제목: `2026 울주숏폼공모전_AI편_[이름]`
- [ ] 본문에 릴스 URL 기입 + 원본 파일 첨부 → ulju_contest@naver.com
- [ ] 접수 확인 회신 받기
- [ ] 12/10까지 전체공개 유지

## 10. 지금 막힌 것

- **1인 출품 편수 제한 / 두 부문 중복 출품 가능 여부**가 공고에 없다. AI 부문에 2편을 넣을 수 있다면 기대값이 크게 달라진다 (AI 부문 수상 8명 / 예비심사 통과 15편 내외). ulju_contest@naver.com에 확인할 것.
- Kling 마스터 파일의 실제 해상도 확인.
