import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.learnenglisheasy.lexi',
  appName: 'Лекси',
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
    },
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
