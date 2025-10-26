<script setup lang="ts">
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const openLink = async (url: string) => {
  // В мобильном приложении открываем в системном браузере
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ 
      url,
      presentationStyle: 'fullscreen'
    });
  } else {
    // В веб-версии открываем в новой вкладке
    window.open(url, '_blank');
  }
};
</script>

<template>
  <div class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <a href="#" @click.prevent="openLink('/privacy-policy.html')" class="footer-link">
          Политика конфиденциальности
        </a>
        <span class="footer-separator">/</span>
        <a href="#" @click.prevent="openLink('/terms-of-service.html')" class="footer-link">
          Условия использования
        </a>
      </div>
      <p class="footer-copyright">© 2024 Слова.Day</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-footer {
  padding: 20px;
  margin-top: 40px;
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
  }
}

.footer-separator {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.footer-copyright {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin: 0;
}

@media (max-width: 480px) {
  .app-footer {
    padding: 16px;
    margin-top: 32px;
  }

  .footer-link {
    font-size: 0.85rem;
  }

  .footer-copyright {
    font-size: 0.8rem;
  }
}
</style>
