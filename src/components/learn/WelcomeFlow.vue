<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useProgressStore } from '@/store/progress';
import { useTransfer } from '@/composables/useTransfer';
import { useSound } from '@/composables/useSound';
import { DAILY_GOALS } from '@/core/progress';
import { trackEvent } from '@/utils/analytics';
import type { LexiMood, LexiView } from '@/art/lexi';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import SpeechBubble from '@/components/ui/SpeechBubble.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import ConfettiBurst from '@/components/ui/ConfettiBurst.vue';

const emit = defineEmits<{ done: [] }>();

const progress = useProgressStore();
const transfer = useTransfer();
const { play } = useSound();

const step = ref(0);
const goal = ref<number>(20);
const sectionId = ref('a1');

/* Лекси знакомится: оборачивается вокруг себя — анфас, вполоборота,
   профиль, спина и обратно, — а потом машет лапой. */
const TURN: Array<{ view: LexiView; flip: boolean }> = [
  { view: 'front', flip: false },
  { view: 'threeQuarter', flip: false },
  { view: 'side', flip: false },
  { view: 'back', flip: false },
  { view: 'side', flip: true },
  { view: 'threeQuarter', flip: true },
  { view: 'front', flip: false },
];
const turn = ref(0);
let timer = 0;

onMounted(() => {
  trackEvent('tutorial_begin');
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    turn.value = TURN.length - 1;
    return;
  }
  timer = window.setInterval(() => {
    if (turn.value >= TURN.length - 1) {
      window.clearInterval(timer);
      return;
    }
    turn.value++;
  }, 320);
});
onBeforeUnmount(() => window.clearInterval(timer));

const hero = computed<{ view: LexiView; flip: boolean; mood: LexiMood }>(() => {
  const t = TURN[turn.value];
  const finished = turn.value >= TURN.length - 1;
  return { ...t, mood: finished ? 'wave' : 'idle' };
});

const GOAL_META: Record<number, { title: string; time: string }> = {
  10: { title: 'Легко', time: '5 минут в день' },
  20: { title: 'Обычно', time: '10 минут в день' },
  30: { title: 'Серьёзно', time: '15 минут в день' },
  50: { title: 'Интенсивно', time: '20 минут в день' },
};

const LEVELS = [
  { id: 'a1', title: 'Начинаю с нуля', badge: 'A1' },
  { id: 'a2', title: 'Знаю несколько слов', badge: 'A2' },
  { id: 'b1', title: 'Могу объясниться', badge: 'B1' },
  { id: 'b2', title: 'Уверенно общаюсь', badge: 'B2' },
  { id: 'c1', title: 'Хочу отточить язык', badge: 'C1' },
  { id: 'topics', title: 'Нужны слова по темам', badge: 'Т' },
];

const next = (): void => {
  play('tap');
  step.value++;
  trackEvent('tutorial_step', { step: step.value });
  if (step.value === 3) play('complete');
};

const finish = (): void => {
  progress.completeOnboarding({ goal: goal.value, sectionId: sectionId.value });
  emit('done');
};

const importFile = (): void => {
  void transfer.chooseFile();
};
</script>

<template>
  <Teleport to="body">
    <div class="welcome" role="dialog" aria-modal="true" aria-label="Знакомство с приложением">
      <div class="welcome__inner">
        <div v-if="step > 0 && step < 3" class="welcome__top">
          <button type="button" class="back" aria-label="Назад" @click="step--">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <ProgressBar :value="step / 3" :height="14" />
        </div>

        <!-- Шаг 0: знакомство -->
        <section v-if="step === 0" class="screen screen--center">
          <LexiMascot :view="hero.view" :flip="hero.flip" :mood="hero.mood" :size="230" />
          <h1 class="h1">Привет! Я Лекси</h1>
          <p class="lead">Помогу выучить английские слова — по несколько минут в день, как в игре.</p>
          <div class="actions">
            <button type="button" class="btn btn--block btn--lg" @click="next">Начнём</button>
            <button type="button" class="btn btn--block btn--secondary" @click="importFile">У меня уже есть прогресс</button>
          </div>
        </section>

        <!-- Шаг 1: цель -->
        <section v-else-if="step === 1" class="screen">
          <div class="say">
            <LexiMascot mood="think" :size="96" />
            <SpeechBubble>Сколько времени в день готовы уделять?</SpeechBubble>
          </div>
          <div class="options" role="radiogroup" aria-label="Цель на день">
            <button
              v-for="g in DAILY_GOALS"
              :key="g"
              type="button"
              role="radio"
              :aria-checked="goal === g"
              class="opt card--press"
              :class="{ 'opt--on': goal === g }"
              @click="goal = g"
            >
              <span class="opt__title">{{ GOAL_META[g].time }}</span>
              <span class="opt__side">{{ GOAL_META[g].title }} · {{ g }} XP</span>
            </button>
          </div>
          <button type="button" class="btn btn--block btn--lg" @click="next">Далее</button>
        </section>

        <!-- Шаг 2: уровень -->
        <section v-else-if="step === 2" class="screen">
          <div class="say">
            <LexiMascot mood="read" :size="96" />
            <SpeechBubble>Какой у вас уровень английского?</SpeechBubble>
          </div>
          <div class="options" role="radiogroup" aria-label="Стартовый уровень">
            <button
              v-for="l in LEVELS"
              :key="l.id"
              type="button"
              role="radio"
              :aria-checked="sectionId === l.id"
              class="opt card--press"
              :class="{ 'opt--on': sectionId === l.id }"
              @click="sectionId = l.id"
            >
              <span class="opt__badge">{{ l.badge }}</span>
              <span class="opt__title">{{ l.title }}</span>
            </button>
          </div>
          <button type="button" class="btn btn--block btn--lg" @click="next">Далее</button>
        </section>

        <!-- Шаг 3: готово -->
        <section v-else class="screen screen--center">
          <ConfettiBurst />
          <LexiMascot mood="cheer" :size="220" />
          <h1 class="h1">Всё готово!</h1>
          <p class="lead">Цель — {{ goal }} XP в день. Первый урок уже ждёт на пути.</p>
          <div class="actions">
            <button type="button" class="btn btn--block btn--lg btn--green" @click="finish">К первому уроку</button>
          </div>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  z-index: 2000;
  overflow-y: auto;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}

.welcome__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: calc(16px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));
}

.welcome__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-subtle);
  cursor: pointer;
}

.back svg { width: 26px; height: 26px; }

.screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  animation: enter 360ms var(--ease) both;
}

.screen--center {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.h1 {
  font-size: 2rem;
  font-weight: 900;
}

.lead {
  max-width: 400px;
  color: var(--text-muted);
  font-size: 1.08rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
}

.say {
  display: flex;
  align-items: center;
  gap: 18px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 60px;
  padding: 12px 16px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
  text-align: left;
  font-weight: 800;
  cursor: pointer;
}

.opt--on {
  border-color: var(--blue);
  background: var(--blue-soft);
  box-shadow: 0 4px 0 var(--blue);
}

.opt__title { flex: 1; font-size: 1.02rem; }
.opt__side { color: var(--text-subtle); font-size: 0.9rem; }
.opt--on .opt__side { color: var(--blue-ink); }

.opt__badge {
  display: grid;
  place-items: center;
  width: 40px;
  height: 36px;
  border-radius: 10px;
  background: var(--violet);
  color: #fff;
  font-weight: 900;
}
</style>
