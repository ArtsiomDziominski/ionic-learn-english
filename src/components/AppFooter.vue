<script setup lang="ts">
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const year = new Date().getFullYear();

const openLink = async (url: string): Promise<void> => {
  // В приложении открываем в системном браузере, в вебе — новой вкладкой
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: `https://www.learnenglisheasy.ru${url}`, presentationStyle: 'fullscreen' });
  } else {
    window.open(url, '_blank', 'noopener');
  }
};
</script>

<template>
  <footer class="footer">
    <nav class="footer__links" aria-label="Правовая информация">
      <a href="/privacy-policy.html" @click.prevent="openLink('/privacy-policy.html')">Политика конфиденциальности</a>
      <span aria-hidden="true">·</span>
      <a href="/terms-of-service.html" @click.prevent="openLink('/terms-of-service.html')">Условия использования</a>
    </nav>
    <p class="footer__copy">© {{ year }} Слова.Day</p>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 0 8px;
  color: var(--text-subtle);
  font-size: 0.82rem;
  text-align: center;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.footer__links a {
  color: var(--text-muted);
  font-weight: 700;
  text-decoration: none;
}

.footer__links a:hover {
  text-decoration: underline;
}
</style>
