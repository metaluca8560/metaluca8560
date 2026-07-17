import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'vacation-molppang',
  web: {
    host: 'localhost',
    port: 5174,
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
    displayName: '여름휴가 몰빵계산기',
    primaryColor: '#0797d3',
    icon: 'https://metaluca8560.vercel.app/vacation-molppang-icon.png',
  },
  permissions: [],
});
