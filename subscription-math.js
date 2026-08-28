// 구독료 다이어트 — 계산 로직.
// 클래식 스크립트로 쓴다(export 금지). DOM과 localStorage를 건드리지 않는다.
var SubMath = (function () {
  var COFFEE_PRICE = 5000; // 커피 환산 기준
  var DAYS_PER_YEAR = 365;

  function priceOf(prices, id) {
    var v = prices[id];
    return typeof v === 'number' && isFinite(v) ? v : 0;
  }

  function monthlyTotal(ids, prices) {
    var sum = 0;
    for (var i = 0; i < ids.length; i++) sum += priceOf(prices, ids[i]);
    return sum;
  }

  function summarize(monthly) {
    var yearly = monthly * 12;
    return {
      monthly: monthly,
      yearly: yearly,
      daily: Math.round(yearly / DAYS_PER_YEAR),
      coffees: Math.round(yearly / COFFEE_PRICE),
    };
  }

  function savings(ids, prices) {
    var m = monthlyTotal(ids, prices);
    return { monthly: m, yearly: m * 12 };
  }

  function topSpenders(ids, prices, n) {
    var rows = [];
    for (var i = 0; i < ids.length; i++) {
      var p = prices[ids[i]];
      // 금액을 아직 안 넣은 항목은 순위에 넣지 않는다.
      if (typeof p === 'number' && isFinite(p)) rows.push({ id: ids[i], price: p });
    }
    rows.sort(function (a, b) { return b.price - a.price; });
    return rows.slice(0, n);
  }

  function missingPriceIds(ids, prices) {
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var p = prices[ids[i]];
      if (!(typeof p === 'number' && isFinite(p))) out.push(ids[i]);
    }
    return out;
  }

  return {
    monthlyTotal: monthlyTotal,
    summarize: summarize,
    savings: savings,
    topSpenders: topSpenders,
    missingPriceIds: missingPriceIds,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubMath;
}
