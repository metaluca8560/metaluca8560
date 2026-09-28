#!/usr/bin/env node
/*
 * 한국어 슬라이드 캡처 확인 (KOREAN.md 5번)
 *
 *   node check-ko.mjs <deck.html> [출력폴더]
 *
 * 하는 일
 *   1. 슬라이드마다 1280×720 캡처, 첫 슬라이드 폰(390×844) 캡처
 *   2. document.fonts에서 지정 폰트가 loaded인지
 *   3. 슬라이드 밖·.frame 밖으로 넘친 요소
 *   4. 글자를 실제로 그린 폰트(CDP). 지정하지 않은 시스템 폰트로 그린 글자가 있으면 알림
 *
 * 폰트 서버에 직접 못 붙는 환경(샌드박스)을 위해 Google Fonts는 curl로 받아 캐시한 뒤
 * page.route()로 넘겨준다. 인증서 검사는 끄지 않는다.
 * 필요: playwright (npm i playwright), curl.  크롬 경로는 CHROME 환경 변수로 바꿀 수 있다.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

import { createRequire } from 'module';

// 스크립트 옆 → 실행한 폴더 순서로 playwright를 찾는다
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  try { ({ chromium } = createRequire(path.join(process.cwd(), 'noop.js'))('playwright')); }
  catch { console.error('playwright가 없습니다. 실행할 폴더에서 npm i playwright 후 그 폴더에서 실행하세요.'); process.exit(2); }
}

const deck = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !fs.existsSync(deck)) { console.error('사용법: node check-ko.mjs <deck.html> [출력폴더]'); process.exit(2); }
const out = path.resolve(process.argv[3] || path.join(path.dirname(deck), 'check-ko'));
const cache = path.join(out, '.font-cache');
fs.mkdirSync(cache, { recursive: true });

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36';
const key = (u) => crypto.createHash('sha1').update(u).digest('hex');
const fetched = (u) => {
  const f = path.join(cache, key(u));
  if (!fs.existsSync(f)) execFileSync('curl', ['-sSf', '-A', UA, '-o', f, u]);
  return fs.readFileSync(f);
};
const failed = [];
async function withFonts(page) {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, async (r) => {
    const u = r.request().url();
    try {
      const body = fetched(u);
      await r.fulfill({ body, contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' });
    } catch { failed.push(u); await r.abort(); }
  });
}

const launch = { executablePath: process.env.CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) };
const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await withFonts(page);
const url = 'file://' + deck;
await page.goto(url, { waitUntil: 'networkidle' });
const count = await page.evaluate(() => document.querySelectorAll('.slide').length);
const cdp = await page.context().newCDPSession(page);
await cdp.send('DOM.enable'); await cdp.send('CSS.enable');

let problems = 0;
for (let i = 0; i < count; i++) {
  await page.evaluate((i) => {
    document.querySelectorAll('.slide').forEach((s, j) => { s.classList.toggle('active', j === i); s.classList.toggle('visible', j === i); });
  }, i);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500); // 등장 애니메이션 대기

  const info = await page.evaluate(() => {
    const s = document.querySelector('.slide.active');
    const sr = s.getBoundingClientRect();
    const frame = s.querySelector('.frame');
    const fr = frame ? frame.getBoundingClientRect() : sr;
    const over = [];
    s.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || el.closest('svg')) return;
      const txt = (el.textContent || '').trim().slice(0, 24);
      if (r.right > sr.right + 2 || r.bottom > sr.bottom + 2) over.push('무대 밖: ' + txt);
      else if (frame && frame.contains(el) && r.bottom > fr.bottom + 4) over.push('.frame 아래로: ' + txt);
    });
    // 텍스트가 있는 말단 요소에 표시를 붙여 CDP로 찾는다
    let n = 0;
    s.querySelectorAll('*').forEach((el) => {
      if ([...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) el.setAttribute('data-ko-check', String(n++));
    });
    const declared = new Set();
    s.querySelectorAll('*').forEach((el) => getComputedStyle(el).fontFamily.split(',').forEach((f) => declared.add(f.trim().replace(/["']/g, ''))));
    const fonts = [...document.fonts].map((f) => `${f.family.replace(/["']/g, '')}:${f.status}`);
    return { over: [...new Set(over)], marked: n, declared: [...declared], fonts };
  });

  // 글자를 실제로 그린 폰트
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.slide.active [data-ko-check]' });
  const fallback = new Map();
  for (const nodeId of nodeIds) {
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    for (const f of fonts) {
      if (!f.isCustomFont) {
        const { outerHTML } = await cdp.send('DOM.getOuterHTML', { nodeId });
        const text = outerHTML.replace(/<[^>]+>/g, '').trim().slice(0, 30);
        fallback.set(`${f.familyName}`, (fallback.get(f.familyName) || []).concat(text));
      }
    }
  }
  await page.evaluate(() => document.querySelectorAll('[data-ko-check]').forEach((el) => el.removeAttribute('data-ko-check')));

  const notLoaded = [...new Set(info.fonts.filter((f) => f.endsWith(':error')).map((f) => f.split(':')[0]))];
  const loaded = new Set(info.fonts.filter((f) => f.endsWith(':loaded')).map((f) => f.split(':')[0]));
  const shot = path.join(out, `slide${i + 1}.png`);
  await page.screenshot({ path: shot });

  console.log(`\n슬라이드 ${i + 1}  →  ${path.relative(process.cwd(), shot)}`);
  console.log(`  불러온 폰트: ${[...loaded].join(', ') || '없음'}`);
  if (notLoaded.length) { problems++; console.log(`  ✗ 불러오기 실패: ${notLoaded.join(', ')}`); }
  if (info.over.length) { problems++; info.over.forEach((o) => console.log(`  ✗ 넘침 ${o}`)); }
  if (fallback.size) {
    problems++;
    for (const [fam, texts] of fallback) console.log(`  ✗ 지정하지 않은 폰트 "${fam}"로 그린 글자: ${[...new Set(texts)].slice(0, 4).join(' | ')}`);
  }
  if (!notLoaded.length && !info.over.length && !fallback.size) console.log('  문제 없음');
}

const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await withFonts(phone);
await phone.goto(url, { waitUntil: 'networkidle' });
await phone.evaluate(() => document.fonts.ready); await phone.waitForTimeout(1500);
await phone.screenshot({ path: path.join(out, 'phone.png') });
await browser.close();

if (failed.length) console.log(`\n폰트 요청 ${failed.length}개를 받지 못했습니다 (예: ${failed[0]})`);
console.log(`\n자동 검사 문제 ${problems}건. 캡처는 반드시 눈으로도 본다 (겹침·어색한 줄바꿈은 자동 검사가 못 잡는다).`);
process.exit(problems ? 1 : 0);
