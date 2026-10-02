<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/store/progress';
import GameIcon from '@/components/ui/GameIcon.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';

const progress = useProgressStore();
const { state, dueIds } = storeToRefs(progress);

/* На главной вкладки в стиле мира Лекси — бумажная панель под травой */
const route = useRoute();
const forest = computed(() => route.path.startsWith('/words'));
</script>

<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom" class="tabs" :class="{ 'tabs--forest': forest }">
        <ion-tab-button tab="words" href="/words" class="tab">
          <span class="tab__icon"><GameIcon name="home" :size="30" /></span>
          <ion-label class="tab__label">Учёба</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="practice" href="/practice" class="tab">
          <span class="tab__icon">
            <GameIcon name="dumbbell" :size="30" />
            <span v-if="dueIds.length" class="tab__dot" aria-label="Есть слова для повторения" />
          </span>
          <ion-label class="tab__label">Практика</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="vocabulary" href="/vocabulary" class="tab">
          <span class="tab__icon"><GameIcon name="book" :size="30" /></span>
          <ion-label class="tab__label">Словарь</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/profile" class="tab">
          <span class="tab__icon">
            <img v-if="state.profile.avatar" :src="state.profile.avatar" alt="" class="tab__avatar" />
            <LexiMascot v-else head :size="32" :animated="false" label="" />
          </span>
          <ion-label class="tab__label">Профиль</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<style scoped>
.tabs {
  --background: var(--bg);
  --border: 2px solid var(--line);
  height: auto;
  min-height: 68px;
  padding: 6px 8px;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
}

.tab {
  --color: var(--text-subtle);
  --color-selected: var(--blue-ink);
  --background: transparent;
  --background-focused: transparent;
  --ripple-color: transparent;
  max-width: 120px;
}

.tab__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 54px;
  height: 40px;
  border: 2px solid transparent;
  border-radius: var(--r-md);
  transition: background-color 150ms ease, border-color 150ms ease, transform 200ms var(--spring);
}

/* Выбранная вкладка — рамка и подложка, как в Duolingo */
.tab.tab-selected .tab__icon {
  border-color: var(--blue);
  background: var(--blue-soft);
  transform: translateY(-1px);
}

.tab:not(.tab-selected) .tab__icon {
  filter: saturate(0.85);
}

.tabs--forest {
  --background: var(--paper-bar);
  --border: 2px solid var(--paper-line);
}

.tabs--forest .tab {
  --color: var(--paper-subtle);
  --color-selected: var(--paper-ink);
}

.tabs--forest .tab.tab-selected .tab__icon {
  border-color: transparent;
  background: var(--leaf-soft);
}

.tabs--forest .tab__dot {
  border-color: var(--paper);
}

.tab__label {
  margin-top: 3px;
  font-family: var(--font);
  font-size: 0.72rem;
  font-weight: 800;
}

.tab__avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.tab__dot {
  position: absolute;
  top: 2px;
  right: 8px;
  width: 11px;
  height: 11px;
  border: 2px solid var(--bg);
  border-radius: 50%;
  background: var(--red);
}
</style>
