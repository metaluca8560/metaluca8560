import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'gift-money',
  web: {
    host: 'localhost',
    port: 5181,
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
    displayName: '축의금 계산기',
    primaryColor: '#f472b6',
    icon: 'https://metaluca8560.vercel.app/gift-money-icon.png',
  },
  permissions: [],
});
