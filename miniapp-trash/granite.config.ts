import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'trash-guide',
  web: {
    host: 'localhost',
    port: 5183,
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
    displayName: '버릴까말까',
    primaryColor: '#34d399',
    icon: 'https://metaluca8560.vercel.app/trash-guide-icon.svg',
  },
  permissions: [],
});
