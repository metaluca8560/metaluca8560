# METALUCA 미니앱 워룸 — 운영 가이드

프로젝트 현황판(대시보드)을 Claude 아티팩트로 운영합니다.

- **워룸 URL**: https://claude.ai/code/artifact/10b8f40f-c803-4e40-a265-9e082a6febe6
- **소스**: `docs/warroom/warroom.html` (이 폴더)
- **공유**: 기본 비공개. 페이지의 공유 메뉴에서 링크 공유를 켜면 로그인 없이도 볼 수 있음.

## 갱신 방법

아무 Claude Code 세션에서 이렇게 요청하면 됩니다:

> 워룸 갱신해줘. 소스는 `docs/warroom/warroom.html`, 아티팩트 URL은
> https://claude.ai/code/artifact/10b8f40f-c803-4e40-a265-9e082a6febe6

Claude가 하는 일:

1. `git log`·레포 상태에서 최신 커밋, 머지된 PR, 진행 상황을 읽는다.
2. `warroom.html`의 각 섹션(브리핑 한 줄, 스탯 타일, 최근 작업 흐름, 인프라·연동 상태, 백로그)을 최신 상태로 고쳐 쓴다.
3. 위 아티팩트 URL로 다시 게시한다 — **URL은 그대로 유지되고 내용만 갱신**된다.
4. 고친 `warroom.html`을 커밋해서 소스와 게시본을 일치시킨다.

## 섹션 구성 규칙

| 섹션 | 내용 | 근거 |
|------|------|------|
| 브리핑 | 갱신일 · 최신 커밋 해시 · 한 줄 상태 · 다음 타깃 | `git log -1` |
| 스탯 타일 | 누적 커밋 수 · 미니앱 수 · 웹 도구 수 · 최근 PR 번호 | `git log --oneline \| wc -l`, `ls miniapp*` |
| 최근 작업 흐름 | 최근 머지 5~6건, 색 규칙: 초록=기능, 빨강=수정, 금색=브랜딩 | `git log --oneline` |
| 인프라·연동 상태 | 배포 / 클로페이 결제 단계 / Supabase / 프록시 보안 / n8n | `netlify.toml`, `PAYMENTS.md`, `pay-config.js` |
| 백로그 | 우선순위별 할 일 | `docs/IDEA-TRACES.md` 우선순위 매트릭스 |

## 디자인 규칙

- 색·폰트는 레포 루트 `styles.css`의 LUCA 퍼플 브랜드(`--bg: #241c3f`, 바이올렛·라벤더·골드)를 따른다.
- 상태 색(초록/앰버/빨강)은 브랜드 액센트와 별도의 시맨틱 색으로만 쓴다.
- 외부 리소스(CDN 폰트·스크립트) 금지 — 아티팩트는 자체 완결 페이지여야 한다.
