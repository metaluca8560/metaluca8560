// 루트 shortform/ 대시보드를 미니앱 빌드 입력으로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이(절대 API 주소, 외부 링크 제거)는 여기서 주입해요.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'shortform');

mkdirSync(join(here, 'public'), { recursive: true });

// style.css 복사
copyFileSync(join(src, 'style.css'), join(here, 'style.css'));

// card-generator.js 복사
copyFileSync(join(src, 'card-generator.js'), join(here, 'public', 'card-generator.js'));

// core.js: API 경로를 절대 주소로 변환 (웹뷰에는 상대 경로 기준이 없음)
const coreSrc = readFileSync(join(src, 'core.js'), 'utf8');
const core = coreSrc
  .replace("const PROXY_URL = '/api/proxy'", "const PROXY_URL = 'https://metaluca8560.vercel.app/api/proxy'")
  .replace("const NOTIFY_URL = '/api/notify'", "const NOTIFY_URL = 'https://metaluca8560.vercel.app/api/notify'");
if (core === coreSrc) throw new Error('sync.mjs: core.js에 프록시 주소 변환이 적용되지 않았어요. PROXY_URL 선언이 바뀌었는지 확인하세요.');
writeFileSync(join(here, 'public', 'core.js'), core);

// index.html: 미니앱 경로 정리 + 외부로 나가는 링크 제거 (앱인토스 검수 가이드라인)
const htmlSrc = readFileSync(join(src, 'index.html'), 'utf8');
const html = htmlSrc
  .replace(/\s*<link rel="icon"[^>]*\/>/, '')
  // 로고 링크: 눌러도 열리지 않는 링크는 검수 반려 사유 → 링크가 아닌 일반 요소로 변환
  .replace('<a href="/" class="brand-link" title="디지털다락방 홈">', '<span class="brand-link">')
  .replace('</a>\n      <div class="header-actions">', '</span>\n      <div class="header-actions">')
  // mailto 링크: 토스 웹뷰에서 열리지 않아 반려 사유 → 텍스트로 변환
  .replace(/<a href="mailto:[^"]*"[^>]*>([^<]*)<\/a>/, '<span>$1</span>')
  .replace('href="../logo.svg"', 'href="#"')
  .replace(
    /<a href="https:\/\/luca-darakbang\.netlify\.app\/"[^>]*>([^<]*)<\/a>/,
    '<span style="color:var(--text-muted,#8b95a1);font-size:13px">$1</span>',
  )
  .replace('src="card-generator.js"', 'src="/card-generator.js"')
  .replace('src="core.js"', 'src="/core.js"')
  // 리뷰 요청 모듈 주입 (방문 3회차에 한 번만 요청)
  .replace('</head>', '  <script type="module" src="/src/ait-review.js"></script>\n</head>');
if (html === htmlSrc) throw new Error('sync.mjs: index.html에 변환이 하나도 적용되지 않았어요. 원본 마크업이 바뀌었는지 확인하세요.');
if (/href="https?:\/\//.test(html)) throw new Error('sync.mjs: 미니앱 빌드에 외부 링크가 남아 있어요. 검수 반려 위험 — 링크를 제거하세요.');

writeFileSync(join(here, 'index.html'), html);
console.log('miniapp-shortform 동기화 완료 (index.html + style.css + public/*)');
