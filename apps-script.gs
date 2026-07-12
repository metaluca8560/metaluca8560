/**
 * AI 트렌드 다락방 — 무료 진단 폼 수신 (구글시트 기록 + 이메일 알림)
 *
 * 사용 방법
 * 1) script.google.com 또는 스프레드시트의 [확장 프로그램 > Apps Script]에서 새 프로젝트 생성
 * 2) 기본 코드를 지우고 이 파일 내용을 전부 붙여넣기
 * 3) NOTIFY_EMAIL 값을 받을 이메일로 확인/수정
 * 4) 함수 드롭다운에서 testSubmit 선택 후 ▶ 실행 → 권한 허용 → 메일/시트 생성 확인
 * 5) [배포] > [새 배포] > 유형 "웹 앱" (실행: 나 / 액세스: 모든 사용자) → 웹 앱 URL 복사
 * 6) script.js 의 FORM_ENDPOINT 에 그 URL(…/exec)을 붙여넣기
 *
 * 코드를 수정한 뒤에는 [배포] > [배포 관리] > ✏️ > 버전 "새 버전" 으로 재배포해야 반영됩니다.
 *
 * 스프레드시트에 연결(바인딩)돼 있으면 그 시트를 쓰고,
 * 독립 스크립트면 "AI트렌드 다락방 문의" 스프레드시트를 자동 생성해 사용합니다.
 */

// 알림을 받을 이메일 주소
var NOTIFY_EMAIL = "atlia0318@gmail.com";
// 기록할 시트 탭 이름
var SHEET_NAME = "문의";
// 자동 생성 시 스프레드시트 이름
var SS_TITLE = "AI트렌드 다락방 문의";

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

// 진입점: 폼 제출(URL 인코딩)과 Claude 프록시 요청(JSON)을 하나의 doPost에서 분기
// (Apps Script는 같은 이름의 함수를 두 번 정의하면 나중 것만 동작하므로 반드시 하나여야 합니다)
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.type === "claude_proxy") return claudeProxy(body.prompt);
  } catch (err) {} // JSON이 아니면 폼 제출로 간주
  return handleFormSubmit(e);
}

function handleFormSubmit(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name = p.name || "";
    var contact = p.contact || "";
    var message = p.message || "";
    var page = p.page || "";
    var ts = new Date();

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["접수시각", "이름/업체명", "연락처", "자동화 희망 업무", "유입 페이지"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    sheet.appendRow([ts, name, contact, message, page]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: "[AI 트렌드 다락방] 새 무료 진단 신청 - " + name,
        body:
          "새 무료 진단 신청이 접수되었습니다.\n\n" +
          "■ 이름/업체명: " + name + "\n" +
          "■ 연락처: " + contact + "\n" +
          "■ 자동화 희망 업무: " + (message || "(미입력)") + "\n" +
          "■ 접수시각: " + Utilities.formatDate(ts, "Asia/Seoul", "yyyy-MM-dd HH:mm:ss") + "\n" +
          "■ 유입 페이지: " + page + "\n" +
          "■ 기록 시트: " + ss.getUrl() + "\n",
      });
    }
    return json({ result: "success" });
  } catch (err) {
    // 처리 실패 시에도 알림 메일로 원인을 받아볼 수 있게 함
    if (NOTIFY_EMAIL) {
      try { MailApp.sendEmail(NOTIFY_EMAIL, "[다락방] 폼 처리 오류", String(err)); } catch (e2) {}
    }
    return json({ result: "error", message: String(err) });
  }
}

// 브라우저로 URL을 열었을 때 동작 확인용
function doGet() {
  return json({ result: "ok", message: "AI 트렌드 다락방 폼 엔드포인트가 동작 중입니다." });
}

// 편집기에서 직접 실행해 시트 기록 + 메일 발송을 테스트
function testSubmit() {
  var r = doPost({ parameter: { name: "테스트", contact: "010-0000-0000", message: "동작 확인", page: "manual-test" } });
  Logger.log(r.getContent());
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Claude API 프록시 (틱톡 분석기용) ──
// ⚠️ API 키를 코드에 직접 쓰지 마세요 (저장소가 공개라 키가 유출됩니다).
// Apps Script 편집기의 [프로젝트 설정 > 스크립트 속성]에서 CLAUDE_API_KEY 속성으로 등록하세요.
function claudeProxy(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("CLAUDE_API_KEY");
  if (!apiKey) return json({ error: "CLAUDE_API_KEY 스크립트 속성이 설정되지 않았습니다." });
  if (!prompt || String(prompt).length > 8000) return json({ error: "invalid prompt" });
  var response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
    method: "post",
    contentType: "application/json",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    payload: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
    muteHttpExceptions: true,
  });

  var result = JSON.parse(response.getContentText());
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
