import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'workout-gear',
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
    displayName: '운동복 뭐사지?',
    primaryColor: '#84cc16',
    icon: 'https://metaluca8560.vercel.app/workout-gear-icon.png',
  },
  permissions: [],
});
