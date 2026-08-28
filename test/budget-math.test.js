const test = require('node:test');
const assert = require('node:assert');
const BudgetMath = require('../budget-math.js');

test('daysInMonth: 달마다 일수가 맞다', () => {
  assert.strictEqual(BudgetMath.daysInMonth(2026, 8), 31);
  assert.strictEqual(BudgetMath.daysInMonth(2026, 9), 30);
  assert.strictEqual(BudgetMath.daysInMonth(2026, 2), 28);
  assert.strictEqual(BudgetMath.daysInMonth(2028, 2), 29); // 윤년
});

test('floorTo100: 백원 단위로 내린다', () => {
  assert.strictEqual(BudgetMath.floorTo100(258064), 258000);
  assert.strictEqual(BudgetMath.floorTo100(99), 0);
  assert.strictEqual(BudgetMath.floorTo100(-1234), -1300); // 음수도 내림
});

// 설계 문서의 예시와 같은 값이어야 한다
test('computeStatus: 8월 15일, 예산 50만, 남은 돈 23만', () => {
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 230000, year: 2026, month: 8, day: 15,
  });
  assert.strictEqual(r.totalDays, 31);
  assert.strictEqual(r.elapsedDays, 15);
  assert.strictEqual(r.leftDays, 16);
  assert.strictEqual(r.baseline, 258000);       // 500000 * 16/31 = 258064 → 258000
  assert.strictEqual(r.spent, 270000);
  assert.strictEqual(r.diff, 28000);            // 258000 - 230000
  assert.strictEqual(r.dailyAverage, 18000);    // 270000 / 15
  assert.strictEqual(r.runOutDay, 27);          // 15 + floor(230000/18000)=12
  assert.strictEqual(r.state, 'ahead');
});

test('computeStatus: 아직 한 푼도 안 썼으면 바닥 예상이 없다', () => {
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 500000, year: 2026, month: 8, day: 1,
  });
  assert.strictEqual(r.spent, 0);
  assert.strictEqual(r.dailyAverage, 0);
  assert.strictEqual(r.runOutDay, null);        // 0으로 나누지 않는다
  assert.strictEqual(r.perDayLeft, 16129);      // 500000 / 31
  assert.strictEqual(r.state, 'easy');
});

test('computeStatus: 예산을 넘기면 state가 over 이고 남은 돈이 음수다', () => {
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: -32000, year: 2026, month: 8, day: 28,
  });
  assert.strictEqual(r.state, 'over');
  assert.strictEqual(r.spent, 532000);
  // 넘긴 상태에서도 숫자가 깨지지 않는다
  assert.strictEqual(r.dailyAverage, 19000);   // 532000 / 28
  assert.strictEqual(r.runOutDay, null);       // 이미 바닥났으니 예상 날짜가 없다
  assert.strictEqual(r.leftDays, 3);
  assert.strictEqual(r.perDayLeft, -8000);     // -32000 / 4, 음수라도 유한한 값
  assert.ok(Number.isFinite(r.perDayLeft));
});

test('computeStatus: 남은 돈이 딱 0원이면 over가 아니라 done', () => {
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 0, year: 2026, month: 8, day: 20,
  });
  assert.strictEqual(r.state, 'done');   // "0원 넘었어요"가 아니라 "다 썼어요"
  assert.strictEqual(r.spent, 500000);
  assert.strictEqual(r.runOutDay, null); // 남은 돈이 0이면 바닥날 날을 계산하지 않는다
  assert.strictEqual(r.perDayLeft, 0);
});

test('computeStatus: 차이가 예산의 2% 안쪽이면 onTrack', () => {
  // 8월 15일 기준선 258000. 남은 돈 250000이면 차이 8000 (예산의 1.6%)
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 250000, year: 2026, month: 8, day: 15,
  });
  assert.strictEqual(r.diff, 8000);
  assert.strictEqual(r.state, 'onTrack');
});

test('computeStatus: 마지막 날이면 남은 날이 0이고 나눗셈이 깨지지 않는다', () => {
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 20000, year: 2026, month: 8, day: 31,
  });
  assert.strictEqual(r.leftDays, 0);
  assert.strictEqual(r.baseline, 0);
  assert.strictEqual(r.perDayLeft, 20000);      // 남은 날이 0이면 남은 돈 그대로
  assert.ok(Number.isFinite(r.perDayLeft));
});

test('computeStatus: 차이가 예산의 2% 딱 경계면 아직 onTrack', () => {
  // 8월 15일 기준선 258000. 남은 돈 248000이면 차이 10000 = 예산 50만의 정확히 2%
  const onEdge = BudgetMath.computeStatus({
    budget: 500000, remaining: 248000, year: 2026, month: 8, day: 15,
  });
  assert.strictEqual(onEdge.diff, 10000);
  assert.strictEqual(onEdge.state, 'onTrack'); // 경계값은 포함한다

  // 100원만 더 벌어지면 ahead로 넘어간다
  const justOver = BudgetMath.computeStatus({
    budget: 500000, remaining: 247900, year: 2026, month: 8, day: 15,
  });
  assert.strictEqual(justOver.diff, 10100);
  assert.strictEqual(justOver.state, 'ahead');
});

test('computeStatus: 달 중간에 시작해도 가짜 여유가 생기지 않는다', () => {
  // 8월 20일에 50만원으로 시작. 남은 20일치 예산이라는 뜻이다.
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 500000, year: 2026, month: 8, day: 20, startDay: 20,
  });
  assert.strictEqual(r.periodDays, 12);   // 20일~31일, 양쪽 끝 포함
  assert.strictEqual(r.elapsedDays, 1);   // 기간 기준으로 오늘이 첫날
  assert.strictEqual(r.leftDays, 11);
  assert.strictEqual(r.baseline, 458300); // 500000 * 11/12 = 458333 → 458300
  assert.strictEqual(r.spent, 0);
  assert.strictEqual(r.dailyAverage, 0);
  assert.strictEqual(r.runOutDay, null);
  assert.strictEqual(r.perDayLeft, 41666);
  // 여유는 많아야 하루치(500000/12 ≈ 41667, 기준선 백원 내림 몫 100원까지)여야 한다.
  // 예전에는 여기서 -322600, 즉 예산의 3분의 2가 가짜 여유로 잡혔다.
  assert.strictEqual(r.diff, -41700);
  assert.ok(Math.abs(r.diff) <= Math.ceil(500000 / 12) + 100,
    '시작한 날의 여유가 하루치를 넘었다: ' + r.diff);
});

test('computeStatus: 시작한 날 기준으로 하루 평균과 바닥 예상을 계산한다', () => {
  // 8월 20일에 50만원으로 시작해서 25일에 30만원 남음 → 6일 동안 20만원 썼다
  const r = BudgetMath.computeStatus({
    budget: 500000, remaining: 300000, year: 2026, month: 8, day: 25, startDay: 20,
  });
  assert.strictEqual(r.elapsedDays, 6);       // 1일이 아니라 20일부터 센다
  assert.strictEqual(r.dailyAverage, 33333);  // 200000 / 6
  assert.strictEqual(r.baseline, 250000);     // 500000 * 6/12
  assert.strictEqual(r.diff, -50000);
  assert.strictEqual(r.state, 'easy');
  assert.strictEqual(r.runOutDay, null);      // 25 + 9 = 34일은 8월에 없다
  assert.strictEqual(r.perDayLeft, 42857);    // 300000 / 7
});

test('computeStatus: startDay가 1이거나 없으면 예전과 똑같이 계산한다', () => {
  const withOne = BudgetMath.computeStatus({
    budget: 500000, remaining: 230000, year: 2026, month: 8, day: 15, startDay: 1,
  });
  const without = BudgetMath.computeStatus({
    budget: 500000, remaining: 230000, year: 2026, month: 8, day: 15,
  });
  assert.deepStrictEqual(withOne, without); // 예전 저장값도 안 깨진다
  assert.strictEqual(without.startDay, 1);
  assert.strictEqual(without.periodDays, 31);
  assert.strictEqual(without.baseline, 258000);
});

test('computeStatus: 이상한 startDay가 들어와도 나눗셈이 깨지지 않는다', () => {
  const tooBig = BudgetMath.computeStatus({
    budget: 500000, remaining: 500000, year: 2026, month: 8, day: 31, startDay: 99,
  });
  assert.strictEqual(tooBig.startDay, 31);  // 말일로 잘라낸다
  assert.strictEqual(tooBig.periodDays, 1);
  assert.ok(Number.isFinite(tooBig.baseline));
  assert.ok(Number.isFinite(tooBig.perDayLeft));

  const junk = BudgetMath.computeStatus({
    budget: 500000, remaining: 500000, year: 2026, month: 8, day: 15, startDay: null,
  });
  assert.strictEqual(junk.startDay, 1);     // 값이 없으면 1일로 본다
  assert.ok(Number.isFinite(junk.baseline));
});

test('isNewMonth: 저장된 달과 지금 달이 다르면 참', () => {
  assert.strictEqual(BudgetMath.isNewMonth('2026-08', '2026-09'), true);
  assert.strictEqual(BudgetMath.isNewMonth('2026-08', '2026-08'), false);
  assert.strictEqual(BudgetMath.isNewMonth('2026-12', '2027-01'), true);
  assert.strictEqual(BudgetMath.isNewMonth(null, '2026-08'), true); // 저장값 없으면 새 달로 본다
});
