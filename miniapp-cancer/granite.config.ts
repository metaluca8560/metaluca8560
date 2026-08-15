import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'cancer-basics',
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
    displayName: '암이란 무엇인가',
    primaryColor: '#6C3FC5',
    icon: 'https://metaluca8560.vercel.app/cancer-basics-icon.png',
  },
  permissions: [],
});
