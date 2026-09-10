<template>
  <div class="home app-enter">
    <!-- Статус дня: стрик + цель + единственное главное действие.
         Раньше здесь был декоративный градиентный герой без данных. -->
    <section class="today app-card">
      <div class="today__row">
        <div class="today__streak">
          <div class="today__flame" :class="{ 'today__flame--cold': currentStreak === 0 }">
            <ion-icon :icon="flameOutline" />
          </div>
          <div>
            <p class="today__streak-value app-nums">{{ currentStreak }}</p>
            <p class="today__streak-label">{{ streakLabel }}</p>
          </div>
        </div>

        <div class="today__goal">
          <p class="app-caption">Цель на сегодня</p>
          <p class="today__goal-value app-nums">{{ todayDone }} / {{ DAILY_GOAL }}</p>
          <div class="today__dots">
            <span
              v-for="n in DAILY_GOAL"
              :key="n"
              class="today__dot"
              :class="{ 'today__dot--on': n <= todayDone }"
            ></span>
          </div>
        </div>
      </div>

      <ion-button
        expand="block"
        class="app-btn-primary today__cta"
        @click="startLearning(FlowWords.Random)"
      >
        {{ ctaLabel }}
      </ion-button>

      <p v-if="totalStudied > 0" class="today__summary">
        Изучено {{ totalStudied }} из {{ totalWords }} слов
      </p>
    </section>

    <!-- Уровни: короткий список с прогрессом, отделён от тем.
         Раньше 22 карточки шли одним потоком без иерархии. -->
    <section class="group">
      <header class="group__head">
        <h2>Уровни</h2>
        <p class="group__hint">От основ до свободного владения</p>
      </header>

      <div class="grid">
        <button
          v-for="card in levelCards"
          :key="card.flow"
          type="button"
          class="tile app-card app-card-interactive"
          @click="startLearning(card.flow)"
        >
          <span class="tile__badge">{{ card.badge }}</span>
          <span class="tile__title">{{ card.title }}</span>
          <span class="tile__subtitle">{{ card.subtitle }}</span>
          <span class="tile__meter" role="presentation">
            <span class="tile__meter-fill" :style="{ width: percentOf(card.flow) + '%' }"></span>
          </span>
          <span class="tile__count app-nums">{{ doneOf(card.flow) }} / {{ totalOf(card.flow) }}</span>
        </button>
      </div>
    </section>

    <!-- Темы -->
    <section class="group">
      <header class="group__head">
        <h2>Темы</h2>
        <p class="group__hint">Слова для конкретных ситуаций</p>
      </header>

      <div class="grid">
        <button
          v-for="card in topicCards"
          :key="card.flow"
          type="button"
          class="tile tile--topic app-card app-card-interactive"
          @click="startLearning(card.flow)"
        >
          <span class="tile__title">{{ card.title }}</span>
          <span class="tile__subtitle">{{ card.subtitle }}</span>
          <span class="tile__meter" role="presentation">
            <span class="tile__meter-fill" :style="{ width: percentOf(card.flow) + '%' }"></span>
          </span>
          <span class="tile__count app-nums">{{ doneOf(card.flow) }} / {{ totalOf(card.flow) }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { IonButton, IonIcon, useIonRouter, onIonViewWillEnter } from '@ionic/vue';
import { flameOutline } from 'ionicons/icons';
import { storeToRefs } from 'pinia';
import { wordsStore } from '@/store/words';
import { settingsStore } from '@/store/settings';
import { statisticsStore } from '@/store/statistics';
import { pointsStore } from '@/store/points';
import { vocabularyStore } from '@/store/vocabulary';
import { FlowWords } from '@/const/flow';
import { words } from '@/content/words_level';

/** Сколько повторений в день считаем выполненной целью. */
const DAILY_GOAL = 3;

const ionRouter = useIonRouter();
const storeWords = wordsStore();
const storeSettings = settingsStore();
const storeStatistics = statisticsStore();
const storePoints = pointsStore();
const storeVocabulary = vocabularyStore();

const { currentWord } = storeToRefs(storeWords);
const { currentStreak } = storeToRefs(storeStatistics);
const { todayRepeatCount } = storeToRefs(storePoints);
const { studiedWords } = storeToRefs(storeVocabulary);

/* Данные могли измениться, пока пользователь проходил урок,
   поэтому перечитываем их при каждом возврате на вкладку. */
const refresh = (): void => {
  storeStatistics.loadStatistics();
  storePoints.loadPoints();
  storeVocabulary.setStudiedWords();
};

onMounted(refresh);
onIonViewWillEnter(refresh);

type FlowCard = {
  flow: FlowWords;
  title: string;
  subtitle: string;
  badge?: string;
};

const levelCards: FlowCard[] = [
  { flow: FlowWords.A1, badge: 'A1', title: 'Beginner', subtitle: 'Основы английского языка' },
  { flow: FlowWords.A2, badge: 'A2', title: 'Elementary', subtitle: 'Простые диалоги и фразы' },
  { flow: FlowWords.B1, badge: 'B1', title: 'Intermediate', subtitle: 'Средний уровень общения' },
  { flow: FlowWords.B2, badge: 'B2', title: 'Upper Int.', subtitle: 'Продвинутое общение' },
  { flow: FlowWords.C1, badge: 'C1', title: 'Advanced', subtitle: 'Профессиональный уровень' },
  { flow: FlowWords.C2, badge: 'C2', title: 'Proficiency', subtitle: 'Уровень носителя' },
];

const topicCards: FlowCard[] = [
  { flow: FlowWords.Pronoun, title: 'Местоимения', subtitle: 'Личные и указательные' },
  { flow: FlowWords.Number, title: 'Числа', subtitle: 'От 0 до миллиарда' },
  { flow: FlowWords.Home, title: 'Дом и быт', subtitle: 'Семья, вещи, повседневность' },
  { flow: FlowWords.Food, title: 'Еда и напитки', subtitle: 'Рестораны и кулинария' },
  { flow: FlowWords.Health, title: 'Здоровье', subtitle: 'Симптомы, лечение, врачи' },
  { flow: FlowWords.Journey, title: 'Путешествия', subtitle: 'Отели, экскурсии, транспорт' },
  { flow: FlowWords.Airport, title: 'Аэропорт', subtitle: 'Регистрация, таможня, багаж' },
  { flow: FlowWords.Auto, title: 'Автомобили', subtitle: 'Дорожное движение' },
  { flow: FlowWords.Business, title: 'Бизнес', subtitle: 'Офис, переговоры, финансы' },
  { flow: FlowWords.Science, title: 'Наука', subtitle: 'Технологии и исследования' },
  { flow: FlowWords.Culture, title: 'Культура', subtitle: 'Искусство, музыка, театр' },
  { flow: FlowWords.Fitness, title: 'Спорт', subtitle: 'Тренировки и здоровье' },
  { flow: FlowWords.Fashion, title: 'Мода', subtitle: 'Одежда, стиль, покупки' },
  { flow: FlowWords.Ecology, title: 'Экология', subtitle: 'Природа и климат' },
  { flow: FlowWords.Government, title: 'Государство', subtitle: 'Политика и управление' },
  { flow: FlowWords.Socialissues, title: 'Общество', subtitle: 'Права и социальные вопросы' },
];

const totalWords = words.length;
const totalStudied = computed((): number => studiedWords.value.length);
const todayDone = computed((): number => Math.min(todayRepeatCount.value, DAILY_GOAL));

const streakLabel = computed((): string => {
  const n = currentStreak.value;
  if (n === 0) return 'Начните серию';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день подряд';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня подряд';
  return 'дней подряд';
});

const ctaLabel = computed((): string =>
  todayRepeatCount.value > 0 ? 'Продолжить обучение' : 'Начать урок'
);

/* Один проход по словарю вместо фильтра на каждую карточку:
   слов тысячи, а карточек 22. */
const levelStats = computed((): Record<string, { done: number; total: number }> => {
  const studied = new Set(studiedWords.value.map((w) => w.word));
  const stats: Record<string, { done: number; total: number }> = {};

  for (const item of words) {
    for (const level of item.levels) {
      if (!stats[level]) stats[level] = { done: 0, total: 0 };
      stats[level].total++;
      if (studied.has(item.word)) stats[level].done++;
    }
  }
  return stats;
});

const doneOf = (flow: FlowWords): number => levelStats.value[flow]?.done ?? 0;
const totalOf = (flow: FlowWords): number => levelStats.value[flow]?.total ?? 0;
const percentOf = (flow: FlowWords): number => {
  const stat = levelStats.value[flow];
  if (!stat || !stat.total) return 0;
  return Math.round((stat.done / stat.total) * 100);
};

const startLearning = (flow: FlowWords): void => {
  storeWords.initializeWordsList(flow);
  ionRouter.push('/words/progress');
  storeSettings.speakText(currentWord.value?.word || '');
};
</script>

<style scoped lang="scss">
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-7);
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-7);
}

/* ——— Статус дня ————————————————————————————— */
.today {
  padding: var(--app-sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-4);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--app-sp-4);
  }

  &__streak {
    display: flex;
    align-items: center;
    gap: var(--app-sp-3);
  }

  &__flame {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    display: grid;
    place-items: center;
    border-radius: var(--app-r-md);
    background: var(--app-tint-warning);
    color: var(--app-warning-ink);
    font-size: 22px;

    &--cold {
      background: var(--app-surface-2);
      color: var(--app-text-subtle);
    }
  }

  &__streak-value {
    font-size: var(--app-fs-display);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    color: var(--app-text);
    margin: 0;
  }

  &__streak-label {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
    margin: 2px 0 0;
  }

  &__goal {
    text-align: right;
  }

  &__goal-value {
    font-size: var(--app-fs-h2);
    font-weight: 700;
    color: var(--app-text);
    margin: 4px 0 0;
  }

  &__dots {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    margin-top: 6px;
  }

  &__dot {
    width: 18px;
    height: 5px;
    border-radius: var(--app-r-pill);
    background: var(--app-surface-3);
    transition: background-color var(--app-dur-base) var(--app-ease);

    &--on {
      background: var(--ion-color-success);
    }
  }

  &__cta {
    margin: 0;
  }

  &__summary {
    font-size: var(--app-fs-sm);
    color: var(--app-text-subtle);
    text-align: center;
    margin: 0;
  }
}

/* ——— Группы ————————————————————————————————— */
.group {
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-4);

  &__head {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__hint {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
  }
}

/* Две колонки вместо одной: на экран помещается вчетверо больше
   карточек, выбор не требует долгой прокрутки. */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--app-sp-3);
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: var(--app-sp-4);
  min-height: 120px;
  text-align: left;
  font-family: inherit;
  color: var(--app-text);
  -webkit-tap-highlight-color: transparent;

  &__badge {
    align-self: flex-start;
    padding: 3px 8px;
    margin-bottom: 3px;
    border-radius: var(--app-r-xs);
    background: var(--app-tint-primary);
    color: var(--app-accent-ink);
    font-size: var(--app-fs-caption);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  &__title {
    font-size: var(--app-fs-body);
    font-weight: 650;
    line-height: 1.3;
  }

  &__subtitle {
    font-size: var(--app-fs-sm);
    color: var(--app-text-muted);
    line-height: 1.35;
  }

  /* Прогресс прижат к низу, чтобы полоски выстраивались
     на одной линии независимо от длины подписи */
  &__meter {
    width: 100%;
    height: 4px;
    margin-top: auto;
    border-radius: var(--app-r-pill);
    background: var(--app-surface-3);
    overflow: hidden;
  }

  &__meter-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--ion-color-primary);
    transition: width var(--app-dur-slow) var(--app-ease);
  }

  &__count {
    font-size: var(--app-fs-caption);
    color: var(--app-text-subtle);
    font-weight: 600;
  }

  &--topic {
    min-height: 108px;
  }
}

@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  }
}
</style>
