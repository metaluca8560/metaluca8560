// 루트 dream-analyzer.html(무료 버전)을 미니앱용 index.html로 변환하는 스크립트.
// 원본 한 벌만 유지하고, 미니앱 전용 차이는 여기서 주입해요.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'dream-analyzer.html'), 'utf8');

let out = src
  // 스트리밍 프록시는 웹뷰 안에서 상대 경로가 없으므로 절대 주소로 교체
  .replace(
    "const PROXY_URL = '/api/dream'",
    "const PROXY_URL = 'https://metaluca8560.vercel.app/api/dream'",
  )
  // 앱인토스 가이드라인: 미니앱 밖으로 나가는 링크 금지 → 헤더 링크를 텍스트로 교체
  .replace(
    '<a href="index.html">AI 트렌드 다락방</a>',
    '<span style="color:var(--muted);font-size:14px">AI 트렌드 다락방</span>',
  )
  // 출처 섹션의 외부 링크를 일반 텍스트로 변환 (텍스트는 유지)
  .replace(/<a href="https?:\/\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g, '<span>$1</span>')
  // 파비콘/헤더 로고는 번들에 없으므로 제거
  .replace(/\s*<link rel="icon"[^>]*\/>/, '')
  .replace(/\s*<img src="automation\/logo\.svg"[^>]*\/>/, '');

if (out === src) throw new Error('sync.mjs: 변환이 하나도 적용되지 않았어요. 원본 마크업이 바뀌었는지 확인하세요.');

writeFileSync(join(here, 'index.html'), out);
console.log('miniapp-dream/index.html generated from ../dream-analyzer.html');
