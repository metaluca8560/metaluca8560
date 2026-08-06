// 루트 trash-guide.html을 미니앱용 index.html로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이(SDK 브릿지, 파비콘 제거, 외부 링크 제거)는 여기서 주입해요.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'trash-guide.html'), 'utf8');

let out = src
  // 파비콘은 번들에 없으므로 제거
  .replace(/\s*<link rel="icon"[^>]*>/, '')
  // 앱인토스 가이드라인: 미니앱 밖으로 나가는 링크 금지 → 네이버 검색 링크를 안내 문구로 교체
  .replace(
    /'<a href="https:\/\/search\.naver\.com[^']*' \+ query \+ '"[^>]*>[^<]*<\/a>/,
    `'지도·검색 앱에서 <b>"' + r + ' 대형폐기물 신고"</b>를 검색해 보세요.`,
  )
  // SDK 브릿지 주입 (vite가 모듈로 번들링)
  .replace('</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>');

if (out === src) throw new Error('sync.mjs: 변환이 하나도 적용되지 않았어요. 원본 마크업이 바뀌었는지 확인하세요.');

writeFileSync(join(here, 'index.html'), out);
console.log('miniapp-trash/index.html generated from ../trash-guide.html');
