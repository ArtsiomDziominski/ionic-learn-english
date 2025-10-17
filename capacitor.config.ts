import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.learn.english',
  appName: 'Daily Easy English',
  webDir: 'dist',
  ios: {
    // Настройки для корректной работы iOS swipe back gesture
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
