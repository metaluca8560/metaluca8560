import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'dream-analyzer',
  web: {
    host: 'localhost',
    port: 5175,
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
    displayName: 'AI 꿈분석기',
    primaryColor: '#6d5bd0',
    icon: 'https://metaluca8560.vercel.app/dream-analyzer-icon.png',
  },
  permissions: [],
});
