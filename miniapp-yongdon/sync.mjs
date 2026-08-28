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

let out = src;

// public/ 루트 기준으로 경로 조정
const beforeScriptFix = out;
out = out.replace('<script src="budget-math.js"></script>', '<script src="/budget-math.js"></script>');
if (out === beforeScriptFix) {
  throw new Error('sync.mjs: budget-math.js 스크립트 태그 교체가 적용되지 않았어요. 원본의 <script src="budget-math.js"></script> 태그가 바뀌거나 사라졌는지 확인하세요.');
}

// SDK 브릿지 주입 (vite가 모듈로 번들링)
const beforeBridgeInject = out;
out = out.replace('</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>');
if (out === beforeBridgeInject) {
  throw new Error('sync.mjs: SDK 브릿지 스크립트 주입이 적용되지 않았어요. 원본에 </head> 태그가 있는지 확인하세요.');
}

// href/src 둘 다 검사 — <script src="http://...">, <img src="http://...">, <iframe src="http://...">까지 잡아야
// 검수 반려를 막을 수 있어요. 위에서 만든 "/budget-math.js", "/src/ait-bridge.js"는 절대경로가 아니라
// 프로토콜(http/https)이 없는 상대경로라 이 검사에 걸리지 않아요.
if (/(?:href|src)="https?:\/\//.test(out)) {
  throw new Error('sync.mjs: 미니앱 빌드에 외부 링크(href 또는 src)가 남아 있어요. 검수 반려 위험 — 링크를 제거하세요.');
}

writeFileSync(join(here, 'index.html'), out);
console.log('miniapp-yongdon/index.html generated from ../yongdon-speed.html');
