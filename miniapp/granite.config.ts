import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'salary-analyzer',
  web: {
    host: 'localhost',
    port: 5173,
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
    displayName: '급여명세서 해석기',
    primaryColor: '#3182f6',
    icon: 'https://metaluca8560.vercel.app/miniapp-icon.png',
  },
  permissions: [],
});
