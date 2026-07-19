import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'severance-calc',
  web: {
    host: 'localhost',
    port: 5179,
    commands: {
      dev: 'npm run web:dev',
      build: 'npm run web:build',
    },
  },
  webViewProps: {
    type: 'partner',
  },
  outdir: 'dist',
  brand: {
    displayName: '퇴직금 미리보기',
    primaryColor: '#fbbf24',
    icon: 'https://metaluca8560.vercel.app/severance-calc-icon.png',
  },
  permissions: [],
});
