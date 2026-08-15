// 루트 cancer-basics.html을 미니앱용 index.html로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이(SDK 브릿지, 파비콘 제거)는 여기서 주입해요.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'cancer-basics.html'), 'utf8');

let out = src;
const applied = [];

// 파비콘은 번들에 필요 없으므로 제거 (아이콘은 granite.config.ts의 brand.icon으로 지정)
const beforeIcon = out;
out = out.replace(/\s*<link rel="icon"[^>]*\/>/, '');
if (out !== beforeIcon) applied.push('favicon 제거');

// 앱인토스 SDK 브릿지 주입 (vite가 모듈로 번들링)
const beforeBridge = out;
out = out.replace('</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>');
if (out !== beforeBridge) applied.push('SDK 브릿지 주입');

if (applied.length < 2) {
  throw new Error(
    `sync.mjs: 변환이 일부만 적용됐어요 (적용: ${applied.join(', ') || '없음'}). ` +
      '원본 cancer-basics.html의 마크업이 바뀌었는지 확인하세요.',
  );
}

writeFileSync(join(here, 'index.html'), out);
console.log(`miniapp-cancer/index.html generated from ../cancer-basics.html (${applied.join(', ')})`);
