import { chromium } from 'playwright';
const FONT = `"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif`;
const P = '#6C3FC5', ROSE = '#D0356A', INK = '#2B1B3F', SUB = '#5C4B72', SOFT = '#8B7BA0';

const YEARS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
const chips = YEARS.map(y => {
  const on = y % 2 === 0;
  return `<div class="chip ${on ? 'on' : 'off'}">${y}${on ? '<i></i>' : ''}</div>`;
}).join('');

const html = `<html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;font-family:${FONT};overflow:hidden;position:relative;
    background:linear-gradient(128deg,#FCFAFF 0%,#F3ECFF 52%,#FDF1F6 100%)}

  /* 뒤에 깔리는 부드러운 빛 — 카드가 납작해 보이지 않게 */
  .blob{position:absolute;border-radius:50%;filter:blur(90px)}
  .b1{width:520px;height:520px;right:-90px;top:-170px;background:rgba(108,63,197,.22)}
  .b2{width:420px;height:420px;right:120px;bottom:-190px;background:rgba(208,53,106,.16)}
  .b3{width:340px;height:340px;left:-120px;bottom:-140px;background:rgba(108,63,197,.10)}

  .box{position:absolute;left:78px;top:0;height:630px;width:560px;
    display:flex;flex-direction:column;justify-content:center;gap:22px}
  .eyebrow{display:inline-flex;align-self:flex-start;align-items:center;gap:9px;
    font-size:19px;font-weight:800;letter-spacing:.12em;color:${P};
    background:rgba(255,255,255,.75);border:1.5px solid rgba(108,63,197,.22);
    border-radius:99px;padding:7px 17px 7px 13px}
  .eyebrow b{width:9px;height:9px;border-radius:50%;background:${ROSE};display:block}
  h1{font-size:82px;font-weight:800;letter-spacing:-.055em;line-height:1.05;color:${INK}}
  .line{font-size:27px;line-height:1.55;color:${SUB};max-width:20ch;font-weight:500}
  .foot{position:absolute;left:78px;bottom:46px;font-size:19px;color:${SOFT};letter-spacing:.03em}

  .grid{position:absolute;right:74px;top:0;height:630px;width:452px;
    display:grid;grid-template-columns:repeat(2,1fr);grid-auto-rows:92px;
    gap:20px;align-content:center}
  .chip{position:relative;border-radius:22px;display:grid;place-items:center;
    font-size:37px;font-weight:800;letter-spacing:-1.6px}
  .chip.on{color:#fff;background:linear-gradient(157deg,#8558E4 0%,#6C3FC5 62%,#5B32AE 100%);
    box-shadow:0 14px 30px -12px rgba(88,44,168,.62), inset 0 1px 0 rgba(255,255,255,.28)}
  .chip.on i{position:absolute;top:13px;right:15px;width:9px;height:9px;border-radius:50%;
    background:rgba(255,255,255,.85)}
  .chip.off{color:#A99CBE;background:rgba(255,255,255,.58);
    border:2px dashed rgba(108,63,197,.26)}
</style></head><body>
<div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>
<div class="grid">${chips}</div>
<div class="box">
  <div class="eyebrow"><b></b>국가암검진</div>
  <h1>내 검진,<br />언제지?</h1>
  <div class="line">태어난 해에 따라<br />받는 해가 갈립니다</div>
</div>
<div class="foot">태어난 해만 넣으면 30초 · 달력 알림까지</div>
</body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const c = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const p = await c.newPage();
await p.setContent(html);
await p.waitForTimeout(250);
await p.screenshot({ path: '/home/user/metaluca8560/cancer-screening-card.png' });
await b.close();
console.log('생성: og-try.png');
