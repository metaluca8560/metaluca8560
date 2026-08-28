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
