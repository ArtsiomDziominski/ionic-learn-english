<script setup lang="ts">
import { settingsStore } from "@/store/settings";
import { storeToRefs } from "pinia";
import AppFooter from "@/components/AppFooter.vue";
import AppSelect from "@/components/UI/AppSelect.vue";
import { computed } from "vue";
import { ThemeType, VoiceSpeech } from "@/const/const";
import { contrastOutline, moonOutline, sunnyOutline, volumeHighOutline } from "ionicons/icons";
import { IonContent, IonIcon } from "@ionic/vue";
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const storeSettings = settingsStore();
const { voiceSpeech, themeMode } = storeToRefs(storeSettings);

/* Сегментированный выбор из трёх режимов вместо переключателя:
   «как в системе» невозможно выразить булевым тумблером. */
const themeOptions = [
  { value: ThemeType.System, label: 'Системная', icon: contrastOutline },
  { value: ThemeType.Light, label: 'Светлая', icon: sunnyOutline },
  { value: ThemeType.Dark, label: 'Тёмная', icon: moonOutline },
];

const setTheme = (mode: ThemeType): void => {
  storeSettings.setThemeMode(mode);
};

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
    <div class="settings-container app-enter">
      <!-- Appearance Settings -->
      <div class="settings-section app-card">
        <div class="section-header">
          <h2 class="section-title">Внешний вид</h2>
          <div class="section-accent"></div>
        </div>

        <div class="settings-items">
          <div class="setting-item setting-item--stacked">
            <div class="setting-info">
              <div class="setting-icon">
                <ion-icon :icon="moonOutline"></ion-icon>
              </div>
              <div class="setting-content">
                <h3 class="setting-title">Тема оформления</h3>
                <p class="setting-description">Системная подстраивается под настройки устройства</p>
              </div>
            </div>

            <div class="theme-switch" role="radiogroup" aria-label="Тема оформления">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                type="button"
                class="theme-switch__option"
                :class="{ 'theme-switch__option--active': themeMode === option.value }"
                role="radio"
                :aria-checked="themeMode === option.value"
                @click="setTheme(option.value)"
              >
                <ion-icon :icon="option.icon" />
                <span>{{ option.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Settings -->
      <div class="settings-section app-card">
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
      <div class="settings-section app-card">
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
      <div class="settings-section app-card">
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
  padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-7);
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-4);
}

/* Settings Sections */
.settings-section {
  background: var(--app-surface-2);
  border-radius: var(--app-r-lg);
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
  color: var(--app-text);
  margin: 0 0 8px 0;
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
  border-bottom: 1px solid var(--app-border);
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
  background: var(--app-surface-2);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
}

.link-arrow {
  font-size: 20px;
  color: var(--app-text-subtle);
  transition: color 0.3s ease;
}

.legal-link:hover .link-arrow {
  color: var(--app-text-muted);
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
  border-radius: var(--app-r-md);
  background: var(--app-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon ion-icon {
  font-size: 24px;
  color: var(--app-text);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.setting-content {
  flex: 1;
  min-width: 0;
}

.setting-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.setting-description {
  font-size: 0.9rem;
  color: var(--app-text-muted);
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  flex-shrink: 0;
}

/* Glass Toggle */
.glass-toggle {
  --track-background: var(--app-surface-3);
  --track-background-checked: var(--app-tint-primary);
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
}

/* Glass Select */
.glass-select {
  background: var(--app-surface-2);
  border-radius: var(--app-r-md);
  color: var(--app-text);
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
  background: var(--app-surface-2);
  border-radius: var(--app-r-md);
}

.app-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--app-r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-icon ion-icon {
  font-size: 32px;
  color: var(--app-text);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.app-details {
  flex: 1;
}

.app-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--app-text);
  margin: 0 0 4px 0;
}

.app-version {
  font-size: 0.9rem;
  color: var(--app-text-subtle);
  margin: 0 0 8px 0;
}

.app-description {
  font-size: 0.95rem;
  color: var(--app-text-muted);
  margin: 0;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-6);
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

  /* Переключатель остаётся справа от подписи: в столбик
     складывается только широкий контрол выбора голоса */
  .setting-item--inline {
    flex-direction: row;
    align-items: center;
    gap: 12px;
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

/* Сегментированный переключатель темы */
.setting-item--stacked {
  flex-direction: column;
  align-items: stretch;
  gap: var(--app-sp-4);
}

.theme-switch {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  border-radius: var(--app-r-md);
  background: var(--app-surface-2);
}

.theme-switch__option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 6px;
  min-height: var(--app-tap);
  border: 0;
  border-radius: var(--app-r-sm);
  background: transparent;
  color: var(--app-text-muted);
  font-family: inherit;
  font-size: var(--app-fs-sm);
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--app-dur-base) var(--app-ease),
              color var(--app-dur-base) var(--app-ease);
}

.theme-switch__option ion-icon {
  font-size: 19px;
}

.theme-switch__option:active {
  transform: scale(0.97);
}

/* Выбранный режим отмечен и заливкой, и цветом, и весом шрифта */
.theme-switch__option--active {
  background: var(--app-surface);
  color: var(--app-accent-ink);
  box-shadow: var(--app-e1);
}
</style>
