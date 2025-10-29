<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="glass-tab-bar">
        <ion-tab-button tab="words" href="/words" class="glass-tab-button">
          <ion-icon aria-hidden="true" :icon="albumsOutline" class="tab-icon" />
          <ion-label class="tab-label">Обучение</ion-label>
          <div class="tab-indicator"></div>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/vocabulary" class="glass-tab-button">
          <ion-icon aria-hidden="true" :icon="fileTrayFullOutline" class="tab-icon" />
          <ion-label class="tab-label">Словарь</ion-label>
          <div class="tab-indicator"></div>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/profile" class="glass-tab-button">
          <ion-icon aria-hidden="true" :icon="personOutline" class="tab-icon" />
          <ion-label class="tab-label">Профиль</ion-label>
          <div class="tab-indicator"></div>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { albumsOutline, fileTrayFullOutline, personOutline } from 'ionicons/icons';
</script>

<style scoped lang="scss">
.glass-tab-bar {
  --background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border);
  border-radius: var(--glass-border-radius) var(--glass-border-radius) 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
  padding: 8px 16px 16px 16px;
  min-height: 80px;
}

.glass-tab-button {
  --color: rgba(255, 255, 255, 0.7);
  --color-selected: #ffffff;
  position: relative;
  border-radius: var(--glass-border-radius-small);
  margin: 0 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px 16px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.glass-tab-button:hover {
  --color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.glass-tab-button.tab-selected {
  background: var(--glass-bg-primary);
  box-shadow: var(--glass-shadow);
  --color: #ffffff;
}

.glass-tab-button.tab-selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: var(--glass-gradient-primary);
  border-radius: var(--glass-border-radius-small);
  z-index: -1;
  opacity: 0.3;
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.glass-tab-button:hover .tab-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.glass-tab-button.tab-selected .tab-icon {
  transform: scale(1.15);
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
}

.tab-label {
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
}

.glass-tab-button.tab-selected .tab-label {
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tab-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--glass-gradient-primary);
  border-radius: 1px;
  transition: width 0.3s ease;
}

.glass-tab-button.tab-selected .tab-indicator {
  width: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .glass-tab-bar {
    padding: 6px 12px 12px 12px;
    min-height: 70px;
  }

  .glass-tab-button {
    padding: 6px 12px;
    min-height: 50px;
    margin: 0 2px;
  }

  .tab-icon {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .tab-label {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .glass-tab-bar {
    padding: 4px 8px 8px 8px;
    min-height: 65px;
  }

  .glass-tab-button {
    padding: 4px 8px;
    min-height: 45px;
  }

  .tab-icon {
    font-size: 18px;
  }

  .tab-label {
    font-size: 0.7rem;
  }
}
</style>
