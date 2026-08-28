// 루트 subscription-diet.html을 미니앱용 index.html로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이는 여기서 주입해요.
// 데이터·계산 파일은 클래식 스크립트라 번들링하지 않고 public/으로 그대로 복사해요.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'subscription-diet.html'), 'utf8');

mkdirSync(join(here, 'public'), { recursive: true });
for (const f of ['subscription-data.js', 'subscription-math.js']) {
  copyFileSync(join(here, '..', f), join(here, 'public', f));
}

let out = src;

// 교체마다 실제로 적용됐는지 따로 확인한다. 하나만 성공하고 지나가면
// 빌드는 되는데 앱이 조용히 깨진다.
const replacements = [
  ['<script src="subscription-data.js"></script>', '<script src="/subscription-data.js"></script>'],
  ['<script src="subscription-math.js"></script>', '<script src="/subscription-math.js"></script>'],
  ['</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>'],
];
for (const [from, to] of replacements) {
  if (!out.includes(from)) {
    throw new Error(`sync.mjs: 원본에서 "${from}" 를 찾지 못했어요. 마크업이 바뀌었는지 확인하세요.`);
  }
  out = out.replace(from, to);
}

// 검수 반려를 막는 마지막 방어선. href와 src를 모두 본다.
if (/(?:href|src)="https?:\/\//.test(out)) {
  throw new Error('sync.mjs: 미니앱 빌드에 외부 링크(href 또는 src)가 남아 있어요.');
}

writeFileSync(join(here, 'index.html'), out);
console.log('miniapp-subdiet/index.html generated from ../subscription-diet.html');
