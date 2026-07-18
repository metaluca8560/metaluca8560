// 루트 shortform/ 대시보드를 미니앱 빌드 입력으로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이는 여기서 주입해요.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'shortform');

mkdirSync(join(here, 'public'), { recursive: true });

// core.js: API 경로를 절대 주소로 (웹뷰에는 상대 경로 기준이 없음)
let core = readFileSync(join(src, 'core.js'), 'utf8')
  .replace("const PROXY_URL = '/api/proxy'", "const PROXY_URL = 'https://metaluca8560.vercel.app/api/proxy'")
  .replace("const NOTIFY_URL = '/api/notify'", "const NOTIFY_URL = 'https://metaluca8560.vercel.app/api/notify'");
writeFileSync(join(here, 'public', 'core.js'), core);

// index.html: 외부/내부 링크 정리 + 스크립트 경로 조정
let html = readFileSync(join(src, 'index.html'), 'utf8')
  .replace(/\s*<link rel="icon"[^>]*\/>/, '')
  .replace(/\s*<img src="\.\.\/logo\.svg"[^>]*\/>/, '')
  .replace(
    '<a href="../index.html">AI 트렌드 다락방</a>',
    '<span style="color:var(--muted);font-size:14px">AI 트렌드 다락방</span>',
  )
  .replace('src="./core.js"', 'src="/core.js"')
  .replace('src="core.js"', 'src="/core.js"');

if (html === readFileSync(join(src, 'index.html'), 'utf8')) {
  throw new Error('sync.mjs: 변환이 하나도 적용되지 않았어요. 원본 마크업이 바뀌었는지 확인하세요.');
}

writeFileSync(join(here, 'index.html'), html);
console.log('miniapp-shortform/index.html + public/core.js generated from ../shortform');
