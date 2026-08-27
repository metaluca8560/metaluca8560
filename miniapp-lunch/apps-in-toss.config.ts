import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 반드시 일치해야 해요.
  appName: 'lunch-molppang',

  webView: {},
  webBundleDir: 'dist',

  brand: {
    primaryColor: '#fb923c'
  },

  permissions: []
});
