// 루트 yongdon-speed.html을 미니앱용 index.html로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이는 여기서 주입해요.
// budget-math.js는 클래식 스크립트라 번들링하지 않고 public/으로 그대로 복사해요.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'yongdon-speed.html'), 'utf8');

mkdirSync(join(here, 'public'), { recursive: true });
copyFileSync(join(here, '..', 'budget-math.js'), join(here, 'public', 'budget-math.js'));

let out = src
  // public/ 루트 기준으로 경로 조정
  .replace('<script src="budget-math.js"></script>', '<script src="/budget-math.js"></script>')
  // SDK 브릿지 주입 (vite가 모듈로 번들링)
  .replace('</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>');

if (out === src) throw new Error('sync.mjs: 변환이 하나도 적용되지 않았어요. 원본 마크업이 바뀌었는지 확인하세요.');
if (/href="https?:\/\//.test(out)) throw new Error('sync.mjs: 미니앱 빌드에 외부 링크가 남아 있어요. 검수 반려 위험 — 링크를 제거하세요.');

writeFileSync(join(here, 'index.html'), out);
console.log('miniapp-yongdon/index.html generated from ../yongdon-speed.html');
