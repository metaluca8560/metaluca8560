// 루트 shortform/ 대시보드를 미니앱 빌드 입력으로 변환하는 스크립트.
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

// core.js: API 경로를 절대 주소로 변환
let core = readFileSync(join(src, 'core.js'), 'utf8')
  .replace("const PROXY_URL = '/api/proxy'", "const PROXY_URL = 'https://metaluca8560.vercel.app/api/proxy'")
  .replace("const NOTIFY_URL = '/api/notify'", "const NOTIFY_URL = 'https://metaluca8560.vercel.app/api/notify'");
writeFileSync(join(here, 'public', 'core.js'), core);

// index.html: 미니앱 경로 정리
let html = readFileSync(join(src, 'index.html'), 'utf8')
  .replace(/\s*<link rel="icon"[^>]*\/>/, '')
  .replace('href="/"', 'href="#"')
  .replace('href="../logo.svg"', 'href="#"')
  .replace('src="card-generator.js"', 'src="/card-generator.js"')
  .replace('src="core.js"', 'src="/core.js"');

writeFileSync(join(here, 'index.html'), html);
console.log('✅ miniapp-shortform 동기화 완료!');
