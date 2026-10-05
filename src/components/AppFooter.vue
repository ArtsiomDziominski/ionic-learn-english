<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useIonRouter } from '@ionic/vue';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const year = new Date().getFullYear();
const route = useRoute();
const router = useIonRouter();

// На самой странице «О сайте» ссылка на неё же не нужна; /about/ со слэшем — тот же экран
const showAbout = computed(() => route.path.replace(/\/+$/, '') !== '/about');

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
    <nav class="footer__links" aria-label="О сайте и правовая информация">
      <template v-if="showAbout">
        <a href="/about" @click.prevent="router.push('/about')">О сайте</a>
        <span aria-hidden="true">·</span>
      </template>
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
