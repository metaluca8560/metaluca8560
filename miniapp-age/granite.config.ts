import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'how-old-am-i',
  web: {
    host: 'localhost',
    port: 5184,
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
    displayName: '나 몇살이지?',
    primaryColor: '#3182f6',
    icon: 'https://luca-darakbang.netlify.app/my-age-icon.svg',
  },
  permissions: [],
});
