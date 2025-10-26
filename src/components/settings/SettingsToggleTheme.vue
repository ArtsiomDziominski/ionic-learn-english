<script setup lang="ts">
import { settingsStore } from "@/store/settings";
import { storeToRefs } from "pinia";
import AppFooter from "@/components/AppFooter.vue";
import AppSelect from "@/components/UI/AppSelect.vue";
import { computed } from "vue";
import { VoiceSpeech } from "@/const/const";
import { volumeHighOutline } from "ionicons/icons";
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const storeSettings = settingsStore();
const { voiceSpeech } = storeToRefs(storeSettings);

// const toggleMode = () => {
//   storeSettings.toggleMode();
// };

const valueVoiceSpeech = computed(() => {
  return voiceSpeech.value?.voiceURI || '';
});

const speechList = computed((): string[] => {
  if (!window.speechSynthesis) {
    return [];
  }
  const speechSynthesisVoices = window.speechSynthesis.getVoices();
  const speechSynthesisVoicesEnglish = speechSynthesisVoices.filter((speech) => speech.lang.includes('en'));
  return speechSynthesisVoicesEnglish.map((speech) => speech.voiceURI);
});

const changeSpeech = (event: any) => {
  if (!window.speechSynthesis) {
    console.warn('Web Speech API is not available');
    return;
  }
  const speech = event?.detail?.value as keyof typeof VoiceSpeech;
  const speechSynthesisVoices = window.speechSynthesis.getVoices();
  if (speech) storeSettings.setVoiceSpeech(speechSynthesisVoices.find((item) => item.voiceURI === speech) || null);
};

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
  <ion-content>
    <div class="settings-container glass-fade-in">
      <!-- Appearance Settings -->
      <!--      <div class="settings-section glass-card">-->
      <!--        <div class="section-header">-->
      <!--          <h2 class="section-title">Внешний вид</h2>-->
      <!--          <div class="section-accent"></div>-->
      <!--        </div>-->
      <!--        -->
      <!--        <div class="settings-items">-->
      <!--          <div class="setting-item">-->
      <!--            <div class="setting-info">-->
      <!--              <div class="setting-icon">-->
      <!--                <ion-icon name="moon"></ion-icon>-->
      <!--              </div>-->
      <!--              <div class="setting-content">-->
      <!--                <h3 class="setting-title">Темная тема</h3>-->
      <!--                <p class="setting-description">Переключиться на темную тему интерфейса</p>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--            <ion-toggle -->
      <!--              :checked="isDarkMode" -->
      <!--              @ion-change="toggleMode" -->
      <!--              class="glass-toggle"-->
      <!--            />-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->

      <!-- Audio Settings -->
      <div class="settings-section glass-card">
        <div class="section-header">
          <h2 class="section-title">Аудио</h2>
          <div class="section-accent"></div>
        </div>

        <div class="settings-items">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-icon">
                <ion-icon :icon="volumeHighOutline"></ion-icon>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">Голосовое воспроизведение</h3>
                <p class="setting-description">Выберите голос для произношения слов</p>
              </div>
            </div>
            <div class="setting-control">
              <AppSelect
                  label="Голос"
                  :value="valueVoiceSpeech"
                  :options="speechList"
                  @ionChange="changeSpeech"
                  class="glass-select"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="settings-section glass-card">
        <div class="section-header">
          <h2 class="section-title">О приложении</h2>
          <div class="section-accent"></div>
        </div>

        <div class="about-content">
          <div class="app-info">
            <div class="app-icon">
              <img src="/assets/icons/icon-192.webp" alt="logo">
            </div>
            <div class="app-details">
              <h3 class="app-name">Слова.Day</h3>
              <p class="app-version">Версия 1.0.5</p>
              <p class="app-description">Эффективное изучение английского языка</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Legal Section -->
      <div class="settings-section glass-card">
        <div class="section-header">
          <h2 class="section-title">Правовая информация</h2>
          <div class="section-accent"></div>
        </div>

        <div class="settings-items">
          <a href="#" @click.prevent="openLink('/terms-of-service.html')" class="setting-item legal-link">
            <div class="setting-info">
              <div class="setting-icon">
                <ion-icon name="document-text-outline"></ion-icon>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">Условия использования</h3>
                <p class="setting-description">Ознакомьтесь с условиями использования приложения</p>
              </div>
            </div>
            <ion-icon name="chevron-forward-outline" class="link-arrow"></ion-icon>
          </a>

          <a href="#" @click.prevent="openLink('/privacy-policy.html')" class="setting-item legal-link">
            <div class="setting-info">
              <div class="setting-icon">
                <ion-icon name="shield-checkmark-outline"></ion-icon>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">Политика конфиденциальности</h3>
                <p class="setting-description">Информация о защите ваших данных</p>
              </div>
            </div>
            <ion-icon name="chevron-forward-outline" class="link-arrow"></ion-icon>
          </a>
        </div>
      </div>
    </div>
    <AppFooter/>
  </ion-content>
</template>

<style scoped lang="scss">
.settings-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Settings Sections */
.settings-section {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.settings-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.section-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.section-accent {
  width: 60px;
  height: 3px;
  border-radius: 2px;
  opacity: 0.8;
}

.settings-items {
  position: relative;
  z-index: 1;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.legal-link {
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.legal-link:hover {
  background: rgba(255, 255, 255, 0.05);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.link-arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
}

.legal-link:hover .link-arrow {
  color: rgba(255, 255, 255, 0.8);
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.setting-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--glass-border-radius-small);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon ion-icon {
  font-size: 24px;
  color: #ffffff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.setting-content {
  flex: 1;
  min-width: 0;
}

.setting-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.setting-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  flex-shrink: 0;
}

/* Glass Toggle */
.glass-toggle {
  --track-background: rgba(255, 255, 255, 0.2);
  --track-background-checked: var(--glass-bg-primary);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
  --handle-width: 28px;
  --handle-height: 28px;
  --handle-max-height: auto;
  --handle-spacing: 4px;
  --handle-border-radius: 50%;
  --handle-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.glass-toggle::part(track) {
  height: 12px;
  width: 60px;
  overflow: visible;
  border-radius: 50px;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

/* Glass Select */
.glass-select {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius-small);
  color: #ffffff;
  min-width: 200px;
  padding: 0 10px;
}

/* About Section */
.about-content {
  position: relative;
  z-index: 1;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius-small);
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--glass-border-radius-small);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-icon ion-icon {
  font-size: 32px;
  color: #ffffff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-version {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 8px 0;
}

.app-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
    gap: 20px;
  }

  .settings-section {
    padding: 20px;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 0;
  }

  .setting-info {
    width: 100%;
  }

  .setting-control {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .glass-select {
    min-width: 150px;
  }

  .app-info {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .app-icon {
    width: 56px;
    height: 56px;
  }

  .app-icon ion-icon {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 12px;
    gap: 16px;
  }

  .settings-section {
    padding: 16px;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .setting-icon {
    width: 40px;
    height: 40px;
  }

  .setting-icon ion-icon {
    font-size: 20px;
  }

  .setting-title {
    font-size: 1rem;
  }

  .setting-description {
    font-size: 0.85rem;
  }

  .app-icon {
    width: 48px;
    height: 48px;
  }

  .app-icon ion-icon {
    font-size: 24px;
  }

  .app-name {
    font-size: 1.1rem;
  }
}
</style>
