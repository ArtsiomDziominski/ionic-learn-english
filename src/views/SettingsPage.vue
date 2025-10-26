<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="glass-toolbar">
        <div class="toolbar">
          <ion-button class="back-btn glass-button" icon @click="toBack">
            <ion-icon :icon="chevronBackOutline" size="large"></ion-icon>
          </ion-button>
          <div class="title-section">
            <h1 class="page-title">Настройки</h1>
            <div class="title-accent"></div>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <SettingsToggleTheme/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonToolbar, IonTitle, IonContent, IonHeader, IonIcon, useIonRouter} from '@ionic/vue';
import { onMounted } from 'vue';
import SettingsToggleTheme from "@/components/settings/SettingsToggleTheme.vue";
import {chevronBackOutline} from "ionicons/icons";
import { useSEO } from '@/composables/useSEO';

const ionRouter = useIonRouter();

const toBack = (): void => {
  ionRouter.back();
}

onMounted(() => {
  useSEO({
    title: 'Настройки | Слова.Day',
    description: 'Настройте приложение для изучения английского языка под себя. Выберите тему оформления и другие параметры для комфортного обучения.',
    url: 'https://www.learnenglisheasy.ru/settings'
  });
});
</script>

<style scoped lang="scss">
.glass-toolbar {
  --background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
}

.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 20px;
  min-height: 60px;
  gap: 16px;
}

.back-btn {
  --background: rgba(255, 255, 255, 0.1);
  --background-hover: rgba(255, 255, 255, 0.2);
  --color: #ffffff;
  --border-radius: var(--glass-border-radius-small);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
  --background: rgba(255, 255, 255, 0.15);
}

.back-btn ion-icon {
  transition: all 0.3s ease;
}

.back-btn:hover ion-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.title-accent {
  width: 60px;
  height: 3px;
  background: var(--glass-gradient-primary);
  border-radius: 2px;
  margin-top: 4px;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .toolbar {
    padding: 0 16px;
    min-height: 56px;
    gap: 12px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .title-accent {
    width: 50px;
    height: 2px;
  }

  .back-btn {
    --padding-start: 10px;
    --padding-end: 10px;
    --padding-top: 10px;
    --padding-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.2rem;
  }

  .title-accent {
    width: 40px;
  }
}
</style>
