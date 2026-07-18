// 루트 tarot/ 앱을 미니앱 빌드 입력으로 복사하는 스크립트.
// 원본 한 벌만 유지해요. app.js·cards-data.js는 전역 변수를 공유하는 클래식 스크립트라
// 번들링하지 않고 public/으로 그대로 복사합니다 (vite가 원본 그대로 배포).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'tarot');

mkdirSync(join(here, 'public'), { recursive: true });
copyFileSync(join(src, 'app.js'), join(here, 'public', 'app.js'));
copyFileSync(join(src, 'cards-data.js'), join(here, 'public', 'cards-data.js'));
copyFileSync(join(src, 'styles.css'), join(here, 'public', 'styles.css'));

// index.html은 public 경로(/) 기준으로 참조 경로만 조정
let html = readFileSync(join(src, 'index.html'), 'utf8')
  .replace('href="./styles.css"', 'href="/styles.css"')
  .replace('src="./cards-data.js"', 'src="/cards-data.js"')
  .replace('src="./app.js"', 'src="/app.js"');

writeFileSync(join(here, 'index.html'), html);
console.log('miniapp-tarot/index.html + public/ generated from ../tarot');
