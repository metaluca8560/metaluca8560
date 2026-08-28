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

  // 예산을 세운 날(startDay)을 1~그 달의 마지막 날 사이로 정리한다.
  // 값이 없거나 이상하면 1일로 본다(= 예전 저장값은 지금까지와 똑같이 계산된다).
  function normalizeStartDay(startDay, totalDays) {
    if (!Number.isFinite(startDay)) return 1;
    var d = Math.floor(startDay);
    if (d < 1) return 1;
    if (d > totalDays) return totalDays;
    return d;
  }

  function computeStatus(input) {
    var budget = input.budget;
    var remaining = input.remaining;
    var totalDays = daysInMonth(input.year, input.month);
    var day = input.day;
    var startDay = normalizeStartDay(input.startDay, totalDays);

    // 예산 기간 = 예산을 세운 날부터 말일까지(양쪽 끝 포함). 1일에 세웠으면 한 달 전체다.
    var periodDays = totalDays - startDay + 1;
    // 기간 안에서 오늘까지 지난 날 수(오늘 포함). startDay가 1이면 예전과 같은 값이다.
    var elapsedDays = day - startDay + 1;
    var leftDays = totalDays - day; // 오늘 이후로 남은 날 수

    var baseline = floorTo100(budget * (leftDays / periodDays));
    var spent = budget - remaining;
    var diff = baseline - remaining;
    var dailyAverage = elapsedDays > 0 ? Math.round(spent / elapsedDays) : 0;

    // 하루 평균이 0 이하면 바닥날 날이 없다. 0으로 나누지 않는다.
    var runOutDay = null;
    if (dailyAverage > 0 && remaining > 0) {
      var daysLeftAtPace = Math.floor(remaining / dailyAverage);
      var candidate = day + daysLeftAtPace; // 달력 날짜라 오늘 날짜에 더한다
      runOutDay = candidate <= totalDays ? candidate : null;
    }

    // 오늘을 포함해 나눈다. 마지막 날이어도 leftDays+1 이 1이라 0으로 나누지 않는다.
    var perDayLeft = Math.floor(remaining / (leftDays + 1));

    var state;
    if (remaining < 0) {
      state = 'over';
    } else if (remaining === 0) {
      state = 'done'; // 딱 0원. 넘긴 건 아니고 다 쓴 것이다
    } else if (Math.abs(diff) <= budget * ON_TRACK_RATIO) {
      state = 'onTrack';
    } else if (diff > 0) {
      state = 'ahead'; // 기준보다 적게 남음 = 많이 썼다
    } else {
      state = 'easy';
    }

    return {
      totalDays: totalDays,
      startDay: startDay,
      periodDays: periodDays,
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

  function isNewMonth(savedMonth, nowMonth) {
    if (!savedMonth) return true;
    return savedMonth !== nowMonth;
  }

  return {
    daysInMonth: daysInMonth,
    floorTo100: floorTo100,
    computeStatus: computeStatus,
    isNewMonth: isNewMonth,
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BudgetMath;
}
