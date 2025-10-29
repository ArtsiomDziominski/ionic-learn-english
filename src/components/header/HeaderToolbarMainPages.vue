<script setup lang="ts">
import {settingsOutline, bookOutline} from "ionicons/icons";
import {IonToolbar, IonTitle, IonIcon, IonButton, useIonRouter} from '@ionic/vue';
import PointsIndicator from '@/components/PointsIndicator.vue';

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

const toBlog = (): void => {
  ionRouter.push('/article');
}
</script>

<template>
  <ion-toolbar class="glass-toolbar">
    <div class="toolbar">
      <div class="title-section">
        <PointsIndicator />
      </div>
      <div class="actions-section">
        <ion-button
          class="blog-btn glass-button"
          fill="clear"
          @click="toBlog"
        >
          <ion-icon :icon="bookOutline" size="large"></ion-icon>
        </ion-button>
        <ion-button
          class="settings-btn glass-button"
          fill="clear"
          @click="toSettings"
        >
          <ion-icon :icon="settingsOutline" size="large"></ion-icon>
        </ion-button>
      </div>
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

.actions-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.blog-btn,
.settings-btn {
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

.blog-btn:hover,
.settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow);
  --background: rgba(255, 255, 255, 0.15);
}

.blog-btn ion-icon,
.settings-btn ion-icon {
  transition: all 0.3s ease;
}

.blog-btn:hover ion-icon,
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

  .blog-btn,
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
