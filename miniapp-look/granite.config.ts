import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'najombwa',
  web: {
    host: 'localhost',
    port: 5178,
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
    displayName: '나좀봐',
    primaryColor: '#38bdf8',
    icon: 'https://vaulted-bus-346411.web.app/look/logo600.png',
  },
  permissions: [],
});
