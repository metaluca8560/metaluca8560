// 용돈 속도계 — 계산 로직.
// 클래식 스크립트로 쓴다(export 금지). 브라우저에서는 전역 BudgetMath로,
// Node 테스트에서는 require로 쓴다. DOM과 localStorage를 건드리지 않는다.
var BudgetMath = (function () {
  var ON_TRACK_RATIO = 0.02; // 차이가 예산의 2% 안쪽이면 "딱 맞게"로 본다

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function floorTo100(amount) {
    return Math.floor(amount / 100) * 100;
  }

  function computeStatus(input) {
    var budget = input.budget;
    var remaining = input.remaining;
    var totalDays = daysInMonth(input.year, input.month);
    var elapsedDays = input.day;
    var leftDays = totalDays - elapsedDays;

    var baseline = floorTo100(budget * (leftDays / totalDays));
    var spent = budget - remaining;
    var diff = baseline - remaining;
    var dailyAverage = elapsedDays > 0 ? Math.round(spent / elapsedDays) : 0;

    // 하루 평균이 0 이하면 바닥날 날이 없다. 0으로 나누지 않는다.
    var runOutDay = null;
    if (dailyAverage > 0 && remaining > 0) {
      var daysLeftAtPace = Math.floor(remaining / dailyAverage);
      var candidate = elapsedDays + daysLeftAtPace;
      runOutDay = candidate <= totalDays ? candidate : null;
    }

    // 오늘을 포함해 나눈다. 마지막 날이어도 leftDays+1 이 1이라 0으로 나누지 않는다.
    var perDayLeft = Math.floor(remaining / (leftDays + 1));

    var state;
    if (remaining <= 0) {
      state = 'over';
    } else if (Math.abs(diff) <= budget * ON_TRACK_RATIO) {
      state = 'onTrack';
    } else if (diff > 0) {
      state = 'ahead'; // 기준보다 적게 남음 = 많이 썼다
    } else {
      state = 'easy';
    }

    return {
      totalDays: totalDays,
      elapsedDays: elapsedDays,
      leftDays: leftDays,
      baseline: baseline,
      spent: spent,
      diff: diff,
      dailyAverage: dailyAverage,
      runOutDay: runOutDay,
      state: state,
      perDayLeft: perDayLeft,
    };
  }

  return {
    daysInMonth: daysInMonth,
    floorTo100: floorTo100,
    computeStatus: computeStatus,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BudgetMath;
}
