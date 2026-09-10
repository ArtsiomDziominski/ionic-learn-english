<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="tab-bar">
        <ion-tab-button tab="words" href="/words" class="tab-button">
          <ion-icon aria-hidden="true" :icon="albumsOutline" class="tab-icon" />
          <ion-label class="tab-label">Обучение</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/vocabulary" class="tab-button">
          <ion-icon aria-hidden="true" :icon="fileTrayFullOutline" class="tab-icon" />
          <ion-label class="tab-label">Словарь</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/profile" class="tab-button">
          <ion-icon aria-hidden="true" :icon="personOutline" class="tab-icon" />
          <ion-label class="tab-label">Профиль</ion-label>
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
/* Таб-бар: сплошная поверхность вместо backdrop-filter.
   Размытие здесь стоило кадра на каждом скролле, а под баром
   всё равно почти всегда однотонный фон. */
.tab-bar {
  --background: var(--app-surface);
  --border: 1px solid var(--app-border);
  padding: 6px 8px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  height: auto;
  min-height: 60px;
}

.tab-button {
  --color: var(--app-text-subtle);
  --color-selected: var(--ion-color-primary);
  --background: transparent;
  --background-focused: transparent;
  --ripple-color: var(--ion-color-primary);
  position: relative;
  min-height: var(--app-tap);
  border-radius: var(--app-r-md);
  transition: color var(--app-dur-base) var(--app-ease);
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 3px;
  transition: transform var(--app-dur-base) var(--app-ease-spring);
}

/* Выбранная вкладка узнаётся тремя сигналами сразу — цвет,
   вес шрифта и подпружиненный подъём иконки. Одного цвета мало:
   при дальтонизме он не читается. */
.tab-button.tab-selected .tab-icon {
  transform: translateY(-2px) scale(1.06);
}

.tab-label {
  font-size: var(--app-fs-caption);
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: none;
  transition: font-weight var(--app-dur-base) var(--app-ease);
}

.tab-button.tab-selected .tab-label {
  font-weight: 700;
}

</style>
