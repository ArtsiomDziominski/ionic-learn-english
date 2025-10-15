<script setup lang="ts">
import {settingsOutline} from "ionicons/icons";
import {IonToolbar, IonTitle, IonIcon, useIonRouter} from '@ionic/vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const ionRouter = useIonRouter();

const toSettings = (): void => {
  ionRouter.push('/settings');
}
</script>

<template>
  <ion-toolbar class="glass-toolbar">
    <div class="toolbar">
      <div class="title-section">
        <h1 class="page-title">{{ title }}</h1>
        <div class="title-accent"></div>
      </div>
      <ion-button
        class="settings-btn glass-button"
        fill="clear"
        @click="toSettings"
      >
        <ion-icon :icon="settingsOutline" size="large"></ion-icon>
      </ion-button>
    </div>
  </ion-toolbar>
</template>

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
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  min-height: 60px;
}

.title-section {
  position: relative;
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

.settings-btn {
  --background: rgba(255, 255, 255, 0.1);
  --background-hover: rgba(255, 255, 255, 0.2);
  --color: #ffffff;
  --border-radius: var(--glass-border-radius-small);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
  --background: rgba(255, 255, 255, 0.15);
}

.settings-btn ion-icon {
  transition: all 0.3s ease;
}

.settings-btn:hover ion-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

/* Responsive Design */
@media (max-width: 768px) {
  .toolbar {
    padding: 0 16px;
    min-height: 56px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .title-accent {
    width: 50px;
    height: 2px;
  }

  .settings-btn {
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
