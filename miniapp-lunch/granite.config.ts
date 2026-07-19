import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'lunch-molppang',
  web: {
    host: 'localhost',
    port: 5180,
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
    displayName: '오늘 점심 뭐먹지?',
    primaryColor: '#fb923c',
    icon: 'https://metaluca8560.vercel.app/lunch-picker-icon.png',
  },
  permissions: [],
});
