import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'gyeotbyeol',
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
    displayName: '곁별',
    primaryColor: '#1b2a5c',
    icon: 'https://metaluca8560.vercel.app/gyeotbyeol-icon.png',
  },
  permissions: [],
});
