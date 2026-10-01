/// <reference types="vitest/config" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        // Без dev-сервера (так работает Vitest) plugin-vue превращает
        // абсолютные пути вроде /assets/icons/... из public/ в импорты,
        // а Vitest не умеет их загружать. В тестах оставляем строками.
        transformAssetUrls: process.env.VITEST ? { includeAbsolute: false } : undefined,
      },
    }),
    legacy()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
