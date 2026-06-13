// ===== 백엔드(Cloudflare Worker) 주소 설정 =====
// 배포 후 Worker 주소를 여기에 붙여넣으세요. (server/README.md 참고)
//   예: window.MEDI_API_BASE = "https://medi-api.이름.workers.dev";
//
// 비워두면( "" ) AI 문진과 실시간 병원목록은 비활성화되고,
// 앱은 기존 룰기반 문진 + 위치기반 지도검색 + 공식포털 링크로 동작합니다.
window.MEDI_API_BASE = "";
