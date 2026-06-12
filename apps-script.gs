/**
 * AI 트렌드 다락방 — 무료 진단 폼 수신 (구글시트 기록 + 이메일 알림)
 *
 * 사용 방법
 * 1) 구글 드라이브에서 새 스프레드시트 생성 (예: "AI트렌드다락방 문의")
 * 2) 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭
 * 3) 기본 코드를 지우고 이 파일 내용을 전부 붙여넣기
 * 4) 아래 NOTIFY_EMAIL 값을 받을 이메일로 바꾸기 (기본값 사용해도 됨)
 * 5) 우측 상단 [배포] > [새 배포] > 유형: "웹 앱"
 *      - 실행 계정: 나
 *      - 액세스 권한: "모든 사용자"
 *    배포 후 표시되는 "웹 앱 URL"(…/exec)을 복사
 * 6) script.js 의 FORM_ENDPOINT 에 그 URL을 붙여넣기
 *
 * 처음 배포 시 권한 승인 창이 뜨면 허용해 주세요.
 */

// 알림을 받을 이메일 주소
var NOTIFY_EMAIL = "atlia0318@gmail.com";
// 기록할 시트 탭 이름
var SHEET_NAME = "문의";

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name = p.name || "";
    var contact = p.contact || "";
    var message = p.message || "";
    var page = p.page || "";
    var ts = new Date();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["접수시각", "이름/업체명", "연락처", "자동화 희망 업무", "유입 페이지"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    sheet.appendRow([ts, name, contact, message, page]);

    if (NOTIFY_EMAIL) {
      var body =
        "새 무료 진단 신청이 접수되었습니다.\n\n" +
        "■ 이름/업체명: " + name + "\n" +
        "■ 연락처: " + contact + "\n" +
        "■ 자동화 희망 업무: " + (message || "(미입력)") + "\n" +
        "■ 접수시각: " + Utilities.formatDate(ts, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss") + "\n" +
        "■ 유입 페이지: " + page + "\n";
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "[AI 트렌드 다락방] 새 무료 진단 신청 - " + name,
        body: body,
        replyTo: looksLikeEmail(contact) ? contact : NOTIFY_EMAIL,
      });
    }

    return json({ result: "success" });
  } catch (err) {
    return json({ result: "error", message: String(err) });
  }
}

// 브라우저로 URL을 열었을 때 동작 확인용
function doGet() {
  return json({ result: "ok", message: "AI 트렌드 다락방 폼 엔드포인트가 동작 중입니다." });
}

function looksLikeEmail(s) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(s || "").trim());
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
