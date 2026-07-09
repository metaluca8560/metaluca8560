/**
 * 클로페이 — 토스페이먼츠 결제 승인(confirm) 백엔드 (Google Apps Script)
 *
 * 결제위젯에서 인증이 끝난 결제를 최종 승인하고, 구글시트에 결제 원장을 기록합니다.
 * 시크릿 키는 브라우저에 노출되면 안 되므로 반드시 이런 서버 측에서 호출해야 합니다.
 *
 * 사용 방법
 * 1) script.google.com 또는 스프레드시트의 [확장 프로그램 > Apps Script]에서 새 프로젝트 생성
 * 2) 기본 코드를 지우고 이 파일 내용을 전부 붙여넣기
 * 3) [프로젝트 설정(⚙️) > 스크립트 속성]에 TOSS_SECRET_KEY 추가
 *    - 테스트: 아래 기본값(공식 문서 공용 테스트 키)을 그대로 써도 됩니다
 *    - 실결제: 토스페이먼츠 [내 개발정보]의 라이브 시크릿 키(live_gsk_...)를 넣으세요
 * 4) 함수 드롭다운에서 testConfirm 선택 후 ▶ 실행 → 권한 허용
 * 5) [배포] > [새 배포] > 유형 "웹 앱" (실행: 나 / 액세스: 모든 사용자) → 웹 앱 URL 복사
 * 6) pay-config.js 의 confirmEndpoint 에 그 URL(…/exec)을 붙여넣기
 *
 * 코드를 수정한 뒤에는 [배포] > [배포 관리] > ✏️ > 버전 "새 버전" 으로 재배포해야 반영됩니다.
 */

// 결제 알림을 받을 이메일 (비우면 메일 발송 안 함)
var NOTIFY_EMAIL = "atlia0318@gmail.com";
// 결제 원장을 기록할 시트 탭 이름
var SHEET_NAME = "결제내역";
// 독립 스크립트일 때 자동 생성할 스프레드시트 이름
var SS_TITLE = "클로페이 결제내역";
// 공식 문서 공용 테스트 시크릿 키 (실결제 시 스크립트 속성 TOSS_SECRET_KEY로 교체)
var DEFAULT_TEST_SECRET = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

function getSecretKey() {
  var key = PropertiesService.getScriptProperties().getProperty("TOSS_SECRET_KEY");
  return key || DEFAULT_TEST_SECRET;
}

function getSpreadsheet() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) {}
  }
  ss = SpreadsheetApp.create(SS_TITLE);
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function doPost(e) {
  try {
    // pay-success.html 이 preflight 회피를 위해 text/plain 으로 JSON을 보냄
    var body = {};
    try { body = JSON.parse(e.postData.contents); } catch (err) {
      return json({ ok: false, message: "요청 본문(JSON)을 읽을 수 없습니다." });
    }
    var paymentKey = String(body.paymentKey || "");
    var orderId = String(body.orderId || "");
    var amount = Number(body.amount);

    if (!paymentKey || !orderId || !(amount > 0)) {
      return json({ ok: false, message: "paymentKey / orderId / amount 가 필요합니다." });
    }

    // ---- 토스페이먼츠 결제 승인 API ----
    var secretKey = getSecretKey();
    var res = UrlFetchApp.fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: "Basic " + Utilities.base64Encode(secretKey + ":"),
      },
      payload: JSON.stringify({ paymentKey: paymentKey, orderId: orderId, amount: amount }),
      muteHttpExceptions: true,
    });
    var status = res.getResponseCode();
    var payment = {};
    try { payment = JSON.parse(res.getContentText()); } catch (err) {}

    if (status !== 200) {
      logRow(orderId, amount, "승인실패", (payment && payment.code) || status, (payment && payment.message) || "");
      return json({ ok: false, code: payment.code || String(status), message: payment.message || "결제 승인에 실패했습니다." });
    }

    // ---- 승인 성공: 원장 기록 + 알림 ----
    logRow(orderId, amount, "승인완료", payment.method || "", payment.paymentKey || paymentKey);
    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: "[클로페이] 결제 승인 완료 - " + amount.toLocaleString() + "원",
          body:
            "결제가 승인되었습니다.\n\n" +
            "■ 주문번호: " + orderId + "\n" +
            "■ 금액: " + amount.toLocaleString() + "원\n" +
            "■ 결제수단: " + (payment.method || "-") + "\n" +
            "■ 승인시각: " + (payment.approvedAt || "-") + "\n" +
            "■ 영수증: " + (payment.receipt && payment.receipt.url ? payment.receipt.url : "-") + "\n",
        });
      } catch (e2) {}
    }
    return json({
      ok: true,
      payment: {
        orderId: payment.orderId,
        method: payment.method,
        totalAmount: payment.totalAmount,
        approvedAt: payment.approvedAt,
        receiptUrl: payment.receipt && payment.receipt.url,
      },
    });
  } catch (err) {
    return json({ ok: false, message: String(err) });
  }
}

function logRow(orderId, amount, result, method, extra) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["승인시각", "주문번호", "금액", "결과", "결제수단/코드", "비고"]);
      sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    }
    sheet.appendRow([new Date(), orderId, amount, result, method, extra]);
  } catch (e) {}
}

// 브라우저로 URL을 열었을 때 동작 확인용
function doGet() {
  var mode = getSecretKey().indexOf("test_") === 0 ? "테스트" : "라이브";
  return json({ ok: true, message: "클로페이 결제 승인 엔드포인트가 동작 중입니다. (모드: " + mode + ")" });
}

// 편집기에서 직접 실행해 권한 허용 + 시트 생성을 테스트
// (실제 paymentKey가 없으므로 "승인실패"가 정상 결과입니다 — 시트/권한 확인용)
function testConfirm() {
  var r = doPost({ postData: { contents: JSON.stringify({ paymentKey: "test_dummy", orderId: "manual_test", amount: 1000 }) } });
  Logger.log(r.getContent());
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
