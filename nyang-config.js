// 냥이동 클라우드 명부 (Supabase) 설정
// 두 값을 채우면 실제 전입 순서대로 주민번호가 발급되고 인구가 집계됩니다.
// 비워두면 로컬 데모 모드 (이름 해시로 번호 발급, 이 브라우저에만 저장).
// 설정 방법은 NYANG.md 참고.
window.NYANG_CONFIG = {
  supabaseUrl: '',     // 예: 'https://xxxx.supabase.co'
  supabaseAnonKey: '', // Settings > API 의 anon public 키 (공개돼도 괜찮은 키)
};
