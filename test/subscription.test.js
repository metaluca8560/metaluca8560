const test = require('node:test');
const assert = require('node:assert');
const SERVICES = require('../subscription-data.js');
const SubMath = require('../subscription-math.js');

test('목록: 항목마다 id·이름·분류가 있고 id가 겹치지 않는다', () => {
  assert.ok(SERVICES.length >= 25, '서비스가 25개 이상이어야 해요');
  const ids = new Set();
  for (const s of SERVICES) {
    assert.ok(s.id && typeof s.id === 'string', 'id가 있어야 해요');
    assert.ok(s.name && typeof s.name === 'string', '이름이 있어야 해요');
    assert.ok(s.category && typeof s.category === 'string', '분류가 있어야 해요');
    assert.ok(s.price === null || typeof s.price === 'number', 'price는 숫자이거나 null이어야 해요');
    assert.ok(s.hint === null || typeof s.hint === 'string', 'hint는 문자열이거나 null이어야 해요');
    assert.ok(!ids.has(s.id), 'id가 겹치면 안 돼요: ' + s.id);
    ids.add(s.id);
  }
});

test('목록: 다른 구독에 포함되는 항목은 안내를 달아 둔다', () => {
  // 쿠팡플레이는 쿠팡 와우에 포함이라 둘 다 세면 총액이 부풀어 오른다.
  const play = SERVICES.filter(s => s.id === 'coupangplay')[0];
  assert.ok(play, '쿠팡플레이가 목록에 있어야 해요');
  assert.strictEqual(play.price, 0, '와우에 포함이므로 기본 금액은 0이어야 해요');
  assert.ok(play.hint && play.hint.indexOf('쿠팡 와우') >= 0, '포함 사실을 안내해야 해요');
});

test('목록: 값이 확실하지 않은 항목은 null로 비워 둔다', () => {
  const blank = SERVICES.filter(s => s.price === null);
  assert.ok(blank.length > 0, '비워 둔 항목이 있어야 해요');
});

test('monthlyTotal: 고른 것들의 금액을 더한다', () => {
  const prices = { a: 10000, b: 5500, c: 7890 };
  assert.strictEqual(SubMath.monthlyTotal(['a', 'b'], prices), 15500);
  assert.strictEqual(SubMath.monthlyTotal([], prices), 0);
});

test('monthlyTotal: 금액이 없는 항목은 0으로 친다', () => {
  const prices = { a: 10000 };
  assert.strictEqual(SubMath.monthlyTotal(['a', 'b'], prices), 10000);
});

test('summarize: 설계 문서의 예시와 값이 같다', () => {
  const r = SubMath.summarize(155800);
  assert.strictEqual(r.monthly, 155800);
  assert.strictEqual(r.yearly, 1869600);   // 155800 * 12
  assert.strictEqual(r.daily, 5122);       // 1869600 / 365 반올림
  assert.strictEqual(r.coffees, 374);      // 1869600 / 5000 반올림
});

test('summarize: 0원이면 전부 0이고 나눗셈이 깨지지 않는다', () => {
  const r = SubMath.summarize(0);
  assert.deepStrictEqual(r, { monthly: 0, yearly: 0, daily: 0, coffees: 0 });
});

test('savings: 설계 문서의 예시와 값이 같다', () => {
  const prices = { watcha: 7900, adobe: 24000, dropbox: 16200 };
  const r = SubMath.savings(['watcha', 'adobe', 'dropbox'], prices);
  assert.strictEqual(r.monthly, 48100);
  assert.strictEqual(r.yearly, 577200);
});

test('savings: 하나도 안 골랐으면 0이다', () => {
  assert.deepStrictEqual(SubMath.savings([], { a: 1000 }), { monthly: 0, yearly: 0 });
});

test('topSpenders: 비싼 순으로 n개만 준다', () => {
  const prices = { a: 5000, b: 29000, c: 24000, d: 7890 };
  const top = SubMath.topSpenders(['a', 'b', 'c', 'd'], prices, 3);
  assert.deepStrictEqual(top, [
    { id: 'b', price: 29000 },
    { id: 'c', price: 24000 },
    { id: 'd', price: 7890 },
  ]);
});

test('topSpenders: 고른 게 n보다 적으면 있는 만큼만 준다', () => {
  const top = SubMath.topSpenders(['a'], { a: 1000 }, 3);
  assert.strictEqual(top.length, 1);
});

test('topSpenders: 금액이 없는 항목은 빼고 준다', () => {
  const top = SubMath.topSpenders(['a', 'b'], { a: 1000 }, 3);
  assert.deepStrictEqual(top, [{ id: 'a', price: 1000 }]);
});

test('missingPriceIds: 금액이 아직 없는 것만 알려준다', () => {
  const prices = { a: 1000, b: 0 };
  assert.deepStrictEqual(SubMath.missingPriceIds(['a', 'b', 'c'], prices), ['c']);
});
