import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'mosquito-control-center',
  web: {
    host: 'localhost',
    port: 5182,
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
    displayName: '모기 방역 관제센터',
    primaryColor: '#4ade80',
    icon: 'https://metaluca8560.vercel.app/mosquito-icon.svg',
  },
  permissions: [],
});
