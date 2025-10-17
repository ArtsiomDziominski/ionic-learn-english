import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.learn.english',
  appName: 'Daily Easy English',
  webDir: 'dist',
  ios: {
    // Отключаем нативный iOS swipe back gesture чтобы избежать конфликта с Ionic навигацией
    contentInset: 'never',
    scrollEnabled: true
  },
  // Отключаем встроенный swipe-to-go-back в webView
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
