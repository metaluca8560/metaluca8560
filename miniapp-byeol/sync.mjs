// 곁별 웹 원본(huhsame-script/landing/byeol)을 미니앱 빌드 입력으로 복사.
// 원본 한 벌만 유지. 곁별은 전역 변수를 공유하는 클래식 스크립트라
// 번들링하지 않고 public/으로 그대로 복사(vite가 원본 그대로 배포).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// 곁별 웹 원본 절대경로 (개인 PC 전용). 경로가 바뀌면 이 상수만 수정.
const src = 'C:/Users/atlia/Desktop/huhsame-script/landing/byeol';

const pub = join(here, 'public');
mkdirSync(join(pub, 'lib'), { recursive: true });

// 클래식 스크립트·스타일·라이브러리 복사
['data.js', 'saju.js', 'compat.js', 'people.js', 'map.js', 'app.js', 'styles.css'].forEach(function (f) {
  copyFileSync(join(src, f), join(pub, f));
});
copyFileSync(join(src, 'lib', 'lunar.js'), join(pub, 'lib', 'lunar.js'));
cpSync(join(src, 'images'), join(pub, 'images'), { recursive: true });

// index.html은 절대경로 /byeol/... → /... (public 루트) 로 치환.
const rawHtml = readFileSync(join(src, 'index.html'), 'utf8');
let html = rawHtml.replace(/(href|src)="\/byeol\//g, '$1="/');
if (html === rawHtml) {
  throw new Error('sync.mjs: /byeol/ 경로 치환이 적용되지 않았어요. 원본 index.html의 href/src="/byeol/..." 형태가 바뀌었거나 사라졌는지 확인하세요.');
}

// SDK 브릿지 주입 (vite가 모듈로 번들링)
const beforeBridgeInject = html;
html = html.replace('</head>', '  <script type="module" src="/src/ait-bridge.js"></script>\n</head>');
if (html === beforeBridgeInject) {
  throw new Error('sync.mjs: SDK 브릿지 스크립트 주입이 적용되지 않았어요. 원본에 </head> 태그가 있는지 확인하세요.');
}

// 화면 안 '돌아가기' 버튼 제거 — 토스 내비게이션 바의 뒤로가기와 중복되면 비게임 검수
// 반려 사유가 된다(2026-09-10 공지의 반복 위반 사례). 웹(/byeol)에는 내비게이션 바가
// 없어 버튼이 필요하므로 원본은 그대로 두고 미니앱 빌드에서만 떼어낸다.
// app.js는 이 버튼이 없어도 동작한다(있을 때만 리스너를 붙임).
const beforeGuideBack = html;
html = html.replace(/[ \t]*<button id="btn-guide-back">[\s\S]*?<\/button>\r?\n/, '');
if (html === beforeGuideBack) {
  throw new Error('sync.mjs: 돌아가기 버튼 제거가 적용되지 않았어요. 원본 index.html의 btn-guide-back 버튼이 사라졌거나 형태가 바뀌었는지 확인하세요. 이미 없다면 이 블록을 지우세요.');
}
if (html.includes('btn-guide-back')) {
  throw new Error('sync.mjs: 미니앱 빌드에 btn-guide-back이 남아 있어요.');
}

// href/src 둘 다 검사 — <script src="http://...">, <img src="http://...">, <iframe src="http://...">까지 잡아야
// 검수 반려를 막을 수 있어요. 위 치환·주입으로 만든 경로들은 프로토콜(http/https)이 없는 상대/루트경로라
// 이 검사에 걸리지 않아요.
if (/(?:href|src)="https?:\/\//.test(html)) {
  throw new Error('sync.mjs: 미니앱 빌드에 외부 링크(href 또는 src)가 남아 있어요. 검수 반려 위험 — 링크를 제거하세요.');
}

writeFileSync(join(here, 'index.html'), html);
console.log('miniapp-byeol/index.html + public/ generated from huhsame-script/landing/byeol');
