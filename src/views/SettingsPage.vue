<script setup lang="ts">
import { ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonToggle } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore, type ThemeMode } from '@/store/settings';
import { useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSpeech } from '@/composables/useSpeech';
import { useTransfer } from '@/composables/useTransfer';
import { DAILY_GOALS } from '@/core/progress';
import PageTopBar from '@/components/PageTopBar.vue';
import AppSheet from '@/components/ui/AppSheet.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import AppFooter from '@/components/AppFooter.vue';

const store = useSettingsStore();
const progress = useProgressStore();
const toast = useToastStore();
const transfer = useTransfer();
const { settings } = storeToRefs(store);
const { speak, englishVoices, available, isNative } = useSpeech();

const resetOpen = ref(false);
const native = Capacitor.isNativePlatform();

const THEMES: Array<{ id: ThemeMode; label: string }> = [
  { id: 'system', label: 'Как в системе' },
  { id: 'light', label: 'Светлая' },
  { id: 'dark', label: 'Тёмная' },
];

const RATES = [
  { value: 0.7, label: 'Медленно' },
  { value: 0.9, label: 'Обычно' },
  { value: 1.1, label: 'Быстро' },
];

const GOAL_LABEL: Record<number, string> = { 10: 'Легко', 20: 'Обычно', 30: 'Серьёзно', 50: 'Интенсивно' };

const reset = (): void => {
  progress.resetAll();
  resetOpen.value = false;
  toast.show('Прогресс сброшен. Начнём заново!', 'info');
};
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Настройки" back />
    </ion-header>

    <ion-content>
      <div class="page stack">
        <section class="group">
          <h2 class="group__title">Оформление</h2>
          <div class="card">
            <p class="row__label">Тема</p>
            <div class="seg" role="radiogroup" aria-label="Тема">
              <button
                v-for="t in THEMES"
                :key="t.id"
                type="button"
                role="radio"
                :aria-checked="settings.theme === t.id"
                class="seg__btn"
                :class="{ 'seg__btn--on': settings.theme === t.id }"
                @click="store.update('theme', t.id)"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
        </section>

        <section class="group">
          <h2 class="group__title">Уроки</h2>
          <div class="card list">
            <label class="row">
              <span class="grow"><span class="row__label">Звуки</span><span class="row__hint">Сигналы верного и неверного ответа</span></span>
              <ion-toggle :checked="settings.sound" aria-label="Звуки" @ion-change="store.update('sound', $event.detail.checked)" />
            </label>
            <label v-if="native" class="row">
              <span class="grow"><span class="row__label">Вибрация</span><span class="row__hint">Отклик на ответы и нажатия</span></span>
              <ion-toggle :checked="settings.haptics" aria-label="Вибрация" @ion-change="store.update('haptics', $event.detail.checked)" />
            </label>
            <label class="row">
              <span class="grow"><span class="row__label">Жизни</span><span class="row__hint">Ошибка в уроке отнимает жизнь, как в Duolingo</span></span>
              <ion-toggle :checked="settings.hearts" aria-label="Жизни" @ion-change="store.update('hearts', $event.detail.checked)" />
            </label>
            <label class="row">
              <span class="grow">
                <span class="row__label">Задания на слух</span>
                <span class="row__hint">{{ available ? 'Узнавать слова по произношению' : 'Озвучка недоступна на этом устройстве' }}</span>
              </span>
              <ion-toggle :checked="settings.listening && available" :disabled="!available" aria-label="Задания на слух" @ion-change="store.update('listening', $event.detail.checked)" />
            </label>
          </div>
        </section>

        <section v-if="available" class="group">
          <h2 class="group__title">Произношение</h2>
          <div class="card list">
            <div v-if="!isNative && englishVoices.length > 1" class="row row--col">
              <label class="row__label" for="voice">Голос</label>
              <select id="voice" class="field" :value="settings.voiceURI ?? ''" @change="store.update('voiceURI', ($event.target as HTMLSelectElement).value || null)">
                <option value="">Автоматически</option>
                <option v-for="v in englishVoices" :key="v.voiceURI" :value="v.voiceURI">{{ v.name }} ({{ v.lang }})</option>
              </select>
            </div>
            <div class="row row--col">
              <p class="row__label">Скорость речи</p>
              <div class="seg" role="radiogroup" aria-label="Скорость речи">
                <button
                  v-for="r in RATES"
                  :key="r.value"
                  type="button"
                  role="radio"
                  :aria-checked="settings.speechRate === r.value"
                  class="seg__btn"
                  :class="{ 'seg__btn--on': settings.speechRate === r.value }"
                  @click="store.update('speechRate', r.value)"
                >
                  {{ r.label }}
                </button>
              </div>
            </div>
            <div class="row">
              <button type="button" class="btn btn--blue btn--sm" @click="speak('Hello! Nice to meet you.')">Прослушать пример</button>
            </div>
          </div>
        </section>

        <section class="group">
          <h2 class="group__title">Цель дня</h2>
          <div class="goals">
            <button
              v-for="g in DAILY_GOALS"
              :key="g"
              type="button"
              class="goal card--press"
              :class="{ 'goal--on': progress.state.dailyGoal === g }"
              :aria-pressed="progress.state.dailyGoal === g"
              @click="progress.setDailyGoal(g)"
            >
              <span class="goal__xp nums">{{ g }} XP</span>
              <span class="goal__label">{{ GOAL_LABEL[g] }}</span>
            </button>
          </div>
        </section>

        <section class="group">
          <h2 class="group__title">Данные</h2>
          <div class="card list">
            <div class="row row--col">
              <span><span class="row__label">Файл прогресса</span><span class="row__hint">Перенос на другое устройство или в другой браузер</span></span>
              <div class="row__actions">
                <button type="button" class="btn btn--secondary btn--sm" @click="transfer.download()">Скачать</button>
                <button type="button" class="btn btn--secondary btn--sm" @click="transfer.chooseFile()">Загрузить</button>
              </div>
            </div>
            <div class="row row--col">
              <span><span class="row__label">Сбросить прогресс</span><span class="row__hint">Удалит слова, уроки, серию и кристаллы на этом устройстве</span></span>
              <div class="row__actions">
                <button type="button" class="btn btn--secondary btn--sm danger" @click="resetOpen = true">Сбросить</button>
              </div>
            </div>
          </div>
        </section>

        <section class="about card">
          <LexiMascot view="threeQuarter" mood="talk" :size="96" />
          <div>
            <p class="about__title">learnenglisheasy.ru · версия 2.0</p>
            <p class="muted">Лекси и команда учат английские слова вместе с вами. Без регистрации и рекламы.</p>
          </div>
        </section>

        <AppFooter />
      </div>
    </ion-content>

    <AppSheet :open="resetOpen" label="Сбросить прогресс?" @close="resetOpen = false">
      <div class="confirm">
        <LexiMascot mood="sad" :size="120" />
        <h2 class="confirm__title">Сбросить весь прогресс?</h2>
        <p class="muted">Это нельзя отменить. Чтобы не потерять данные, сначала скачайте файл прогресса.</p>
        <button type="button" class="btn btn--block btn--secondary" @click="transfer.download()">Скачать файл</button>
        <button type="button" class="btn btn--block btn--red" @click="reset">Сбросить</button>
        <button type="button" class="btn btn--block btn--ghost" @click="resetOpen = false">Отмена</button>
      </div>
    </AppSheet>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.group__title {
  margin-bottom: 8px;
  color: var(--text-subtle);
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.list {
  padding: 4px 16px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 60px;
  padding: 10px 0;
  border-bottom: 2px solid var(--line);
  cursor: pointer;
}

.row:last-child { border-bottom: none; }
.row--col { flex-direction: column; align-items: stretch; cursor: default; }

.row__label {
  display: block;
  font-weight: 800;
}

.row__hint {
  display: block;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.row__actions {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 10px;
  margin-top: 10px;
}

.seg {
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 6px;
  margin-top: 8px;
  padding: 4px;
  border-radius: var(--r-lg);
  background: var(--surface-2);
}

.seg__btn {
  min-height: 40px;
  padding: 6px 8px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-muted);
  font-weight: 800;
  cursor: pointer;
}

.seg__btn--on {
  background: var(--surface);
  color: var(--violet-ink);
  box-shadow: 0 2px 0 var(--line);
}

.goals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.goal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 4px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
}

.goal--on {
  border-color: var(--orange);
  background: var(--orange-soft);
  box-shadow: 0 4px 0 var(--orange);
}

.goal__xp { font-weight: 900; }
.goal__label { color: var(--text-muted); font-size: 0.78rem; font-weight: 800; }

.about {
  display: flex;
  align-items: center;
  gap: 14px;
}

.about__title { font-weight: 900; }

.confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.confirm__title { font-size: 1.35rem; }

.danger { --btn-fg: var(--red-ink); }
</style>
