import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'shortform-lab',
  web: {
    host: 'localhost',
    port: 5177,
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
    displayName: '숏폼 성과 분석기',
    primaryColor: '#a855f7',
    icon: 'https://metaluca8560.vercel.app/shortform-lab-icon.png',
  },
  permissions: [],
});
