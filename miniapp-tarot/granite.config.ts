import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'simyeon-tarot',
  web: {
    host: 'localhost',
    port: 5176,
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
    displayName: '심연의 타로',
    primaryColor: '#d4af37',
    icon: 'https://metaluca8560.vercel.app/simyeon-tarot-icon.png',
  },
  permissions: [],
});
