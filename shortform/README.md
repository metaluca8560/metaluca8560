# 숏폼 트렌드 통합 대시보드

기존 `youtube-analyzer.html`, `tiktok-analyzer.html`, `reels-analyzer.html` 3개 페이지를
하나의 앱으로 통합한 버전입니다.

## 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 대시보드 UI (탭으로 유튜브 쇼츠 / 틱톡 / 인스타 릴스 전환) |
| `core.js` | 공통 엔진 — 플랫폼별 설정(`PLATFORMS`)만 다르고 분석·렌더링·이력 로직은 공유 |

## 기능

- **플랫폼 탭 전환**: 입력 필드, 참여율 공식, AI 프롬프트가 플랫폼에 맞게 자동 변경
- **분석 이력**: 결과를 `localStorage`에 최근 30건 저장. 지난 분석을 다시 열어 비교 가능
- **n8n 알림**: 분석 완료 시 `/api/notify`를 통해 n8n 웹훅으로 전송 (웹훅 주소 비노출)

## 새 플랫폼 추가하기

`core.js`의 `PLATFORMS` 객체에 항목 하나만 추가하면 됩니다
(필드 정의, 참여율 공식, 프롬프트 — HTML 수정 불필요).

## 배포 환경변수 (Vercel)

| 변수 | 필수 | 설명 |
|------|------|------|
| `CLAUDE_API_KEY` | ✅ | Claude API 키 (`api/proxy.js`) |
| `N8N_WEBHOOK_URL` | 선택 | n8n 웹훅 주소. 미설정 시 알림만 조용히 생략 (`api/notify.js`) |
| `ALLOWED_ORIGINS` | 선택 | API 허용 출처 목록 (쉼표 구분). 미설정 시 배포 도메인만 허용. 로컬 테스트 시 `http://localhost:8000` 등을 추가 |
