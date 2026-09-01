import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// 릴스/쇼츠 업로드용 기본값 — 파일 크기와 화질의 균형
Config.setCrf(20);

// 크롬을 직접 받지 못하는 환경(사내망, CI 컨테이너 등)에서는
// REMOTION_BROWSER_EXECUTABLE에 headless shell 경로를 넣어두면 된다.
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
