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
let html = readFileSync(join(src, 'index.html'), 'utf8')
  .replace(/(href|src)="\/byeol\//g, '$1="/');

writeFileSync(join(here, 'index.html'), html);
console.log('miniapp-byeol/index.html + public/ generated from huhsame-script/landing/byeol');
