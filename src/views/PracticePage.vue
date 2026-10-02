<script setup lang="ts">
import { computed } from 'vue';
import { IonContent, IonHeader, IonPage, useIonRouter } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/store/progress';
import { useLessonStore, PRACTICE_META } from '@/store/lesson';
import { useSpeech } from '@/composables/useSpeech';
import { plural } from '@/core/dates';
import type { PracticeMode } from '@/core/lessonBuilder';
import type { GameIconName } from '@/art/icons';
import PageTopBar from '@/components/PageTopBar.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import StatPill from '@/components/ui/StatPill.vue';

const progress = useProgressStore();
const lesson = useLessonStore();
const router = useIonRouter();
const { canListen } = useSpeech();
const { learnedCount, dueIds, weakIds, state, hearts, heartsEnabled } = storeToRefs(progress);

interface Card {
  mode: PracticeMode;
  icon: GameIconName;
  color: string;
  text: string;
  available: boolean;
  reason: string;
}

const words = (n: number): string => `${n} ${plural(n, 'слово', 'слова', 'слов')}`;

const cards = computed<Card[]>(() => {
  const enough = (mode: PracticeMode): boolean => lesson.practiceWords(mode) !== null;
  const learnFirst = 'Выучите хотя бы 4 слова на пути';
  return [
    { mode: 'mistakes', icon: 'target', color: 'var(--red)', text: weakIds.value.length ? `${words(weakIds.value.length)} с ошибками` : 'Ошибок пока нет', available: enough('mistakes'), reason: 'Здесь появятся слова, в которых вы ошибались' },
    { mode: 'review', icon: 'calendar', color: 'var(--orange)', text: dueIds.value.length ? `${words(dueIds.value.length)} пора повторить` : 'Освежите выученное', available: enough('review'), reason: learnFirst },
    { mode: 'listening', icon: 'headphones', color: 'var(--violet)', text: 'Узнавайте слова на слух', available: canListen.value && enough('listening'), reason: canListen.value ? learnFirst : 'Озвучка недоступна на этом устройстве' },
    { mode: 'spelling', icon: 'keyboard', color: 'var(--blue)', text: 'Пишите слова без ошибок', available: enough('spelling'), reason: learnFirst },
    { mode: 'favorites', icon: 'heart', color: 'var(--pink)', text: state.value.favorites.length ? words(state.value.favorites.length) : 'Добавляйте слова в словаре', available: enough('favorites'), reason: 'Отметьте сердечком 4 слова в словаре' },
    { mode: 'quick', icon: 'bolt', color: 'var(--gold)', text: '8 случайных слов', available: enough('quick'), reason: learnFirst },
  ];
});

const start = (card: Card): void => {
  if (!card.available) return;
  router.push(`/lesson/practice-${card.mode}`);
};
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Практика">
        <StatPill icon="heart" :value="heartsEnabled ? hearts : '∞'" color="var(--red)" :label="`Жизни: ${hearts}`" />
      </PageTopBar>
    </ion-header>

    <ion-content>
      <div class="page stack">
        <section class="hero card">
          <LexiMascot :view="learnedCount ? 'side' : 'front'" :mood="learnedCount ? 'run' : 'sleep'" :size="120" />
          <div class="grow">
            <h2 class="hero__title">{{ learnedCount ? 'Тренируйтесь каждый день' : 'Пока нечего повторять' }}</h2>
            <p class="muted">
              {{ learnedCount
                ? `В вашем словаре ${words(learnedCount)}. Тренировка укрепляет память и возвращает жизнь.`
                : 'Пройдите первый урок на пути — и слова появятся здесь.' }}
            </p>
            <button v-if="!learnedCount" type="button" class="btn btn--sm hero__btn" @click="router.push('/words')">К урокам</button>
          </div>
        </section>

        <div class="grid">
          <button
            v-for="card in cards"
            :key="card.mode"
            type="button"
            class="mode card card--press"
            :class="{ 'mode--off': !card.available }"
            :style="{ '--mode': card.color }"
            :aria-disabled="!card.available"
            @click="start(card)"
          >
            <span class="mode__icon"><GameIcon :name="card.icon" :size="40" :muted="!card.available" /></span>
            <span class="mode__title">{{ PRACTICE_META[card.mode].title }}</span>
            <span class="mode__text">{{ card.available ? card.text : card.reason }}</span>
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.hero {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__title { font-size: 1.15rem; }
.hero__btn { margin-top: 10px; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mode {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 150px;
  padding: 14px;
  color: var(--text);
  text-align: left;
}

.mode__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 4px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--mode) 16%, transparent);
}

.mode__title {
  font-size: 1.02rem;
  font-weight: 900;
  line-height: 1.2;
}

.mode__text {
  color: var(--text-muted);
  font-size: 0.86rem;
  line-height: 1.35;
}

.mode--off {
  cursor: default;
  box-shadow: none;
}

.mode--off:active { transform: none; }
.mode--off .mode__icon { background: var(--surface-2); }
.mode--off .mode__title { color: var(--text-subtle); }
</style>
