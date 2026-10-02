<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { LessonRewards } from '@/store/progress';
import { useProgressStore } from '@/store/progress';
import { useSound } from '@/composables/useSound';
import { hapticReward } from '@/composables/useHaptics';
import { WEEKDAYS_SHORT, addDays, formatClock, plural, weekStart } from '@/core/dates';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import CountUp from '@/components/ui/CountUp.vue';
import RingProgress from '@/components/ui/RingProgress.vue';
import ConfettiBurst from '@/components/ui/ConfettiBurst.vue';
import type { GameIconName } from '@/art/icons';

const props = defineProps<{ rewards: LessonRewards; practice: boolean }>();
const emit = defineEmits<{ done: [] }>();

const progress = useProgressStore();
const { play } = useSound();

type Step = 'summary' | 'streak' | 'goal' | 'extras';
const steps = computed<Step[]>(() => {
  const list: Step[] = ['summary'];
  if (props.rewards.streakExtended) list.push('streak');
  if (props.rewards.goalReached) list.push('goal');
  if (props.rewards.achievements.length || props.rewards.questsCompleted.length) list.push('extras');
  return list;
});
const index = ref(0);
const step = computed(() => steps.value[index.value]);

const PRAISE = ['Урок пройден!', 'Отличная работа!', 'Так держать!', 'Великолепно!'];
const title = computed(() => {
  if (props.practice) return 'Тренировка завершена!';
  if (props.rewards.perfect) return 'Без единой ошибки!';
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
});

const tiles = computed<Array<{ icon: GameIconName; label: string; value: number; suffix: string; color: string; text?: string }>>(() => [
  { icon: 'bolt', label: 'Опыт', value: props.rewards.xp, suffix: ' XP', color: 'var(--gold)' },
  { icon: 'target', label: 'Точность', value: props.rewards.accuracy, suffix: '%', color: 'var(--green)' },
  { icon: 'clock', label: 'Время', value: 0, suffix: '', color: 'var(--blue)', text: formatClock(props.rewards.durationMs) },
]);

const week = computed(() => {
  const monday = weekStart(progress.today);
  return WEEKDAYS_SHORT.map((label, i) => {
    const day = addDays(monday, i);
    return { label, day, active: (progress.state.xpByDay[day] ?? 0) > 0, today: day === progress.today };
  });
});

onMounted(() => {
  play('complete');
  hapticReward();
});

const next = (): void => {
  if (index.value < steps.value.length - 1) {
    index.value++;
    if (step.value === 'streak') play('streak');
    else play('coins');
    hapticReward();
  } else {
    emit('done');
  }
};
</script>

<template>
  <div class="done" role="dialog" aria-modal="true" :aria-label="title">
    <div class="done__inner">
      <!-- Итог урока -->
      <section v-if="step === 'summary'" :key="'summary'" class="screen">
        <ConfettiBurst />
        <LexiMascot mood="cheer" :size="210" />
        <h1 class="h1">{{ title }}</h1>
        <div class="tiles">
          <div v-for="(t, i) in tiles" :key="t.label" class="tile" :style="{ '--tile': t.color, animationDelay: `${150 + i * 120}ms` }">
            <p class="tile__label">{{ t.label }}</p>
            <div class="tile__value">
              <GameIcon :name="t.icon" :size="24" />
              <span v-if="t.text" class="nums">{{ t.text }}</span>
              <CountUp v-else :value="t.value" :suffix="t.suffix" :delay="300 + i * 150" />
            </div>
          </div>
        </div>
        <p v-if="rewards.newWords" class="sub">
          +{{ rewards.newWords }} {{ plural(rewards.newWords, 'новое слово', 'новых слова', 'новых слов') }} в вашем словаре
        </p>
        <p v-if="rewards.heartGained" class="sub sub--heart"><GameIcon name="heart" :size="20" /> +1 жизнь за тренировку</p>
        <p v-if="rewards.gems" class="sub sub--gems"><GameIcon name="gem" :size="20" /> +{{ rewards.gems }} кристаллов</p>
      </section>

      <!-- Серия -->
      <section v-else-if="step === 'streak'" :key="'streak'" class="screen">
        <div class="flame">
          <GameIcon name="flame" :size="150" class="flame__icon" />
        </div>
        <p class="big nums"><CountUp :value="rewards.streak" :from="Math.max(0, rewards.streak - 1)" :duration="700" :delay="250" /></p>
        <h1 class="h1 h1--orange">{{ plural(rewards.streak, 'день', 'дня', 'дней') }} подряд!</h1>
        <div class="week">
          <div v-for="d in week" :key="d.day" class="week__day" :class="{ 'week__day--on': d.active, 'week__day--today': d.today }">
            <span>{{ d.label }}</span>
            <span class="week__dot"><svg v-if="d.active" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4L18 8" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
          </div>
        </div>
        <p class="sub">Занимайтесь каждый день, чтобы серия росла.</p>
      </section>

      <!-- Цель дня -->
      <section v-else-if="step === 'goal'" :key="'goal'" class="screen">
        <RingProgress :value="1" :size="170" :stroke="16" color="var(--gold)">
          <GameIcon name="trophy" :size="80" />
        </RingProgress>
        <h1 class="h1">Цель дня выполнена!</h1>
        <p class="sub">{{ progress.state.dailyGoal }} XP за сегодня. Лекси гордится вами!</p>
      </section>

      <!-- Достижения и задания -->
      <section v-else :key="'extras'" class="screen">
        <LexiMascot mood="happy" :size="150" />
        <h1 class="h1">Новые награды</h1>
        <div class="awards">
          <div v-for="a in rewards.achievements" :key="`${a.id}-${a.tier}`" class="award card">
            <span class="award__badge" :style="{ background: a.color }"><GameIcon :name="a.icon" :size="30" /></span>
            <div class="grow">
              <p class="award__title">{{ a.title }} · уровень {{ a.tier }}</p>
              <p class="award__text">+{{ a.reward }} кристаллов</p>
            </div>
          </div>
          <div v-for="q in rewards.questsCompleted" :key="q" class="award card">
            <span class="award__badge award__badge--quest"><GameIcon name="target" :size="30" /></span>
            <div class="grow">
              <p class="award__title">{{ q }}</p>
              <p class="award__text">Задание выполнено — заберите награду на главной</p>
            </div>
          </div>
        </div>
      </section>

      <button type="button" class="btn btn--block btn--lg btn--green done__btn" @click="next">Продолжить</button>
    </div>
  </div>
</template>

<style scoped>
.done {
  position: absolute;
  inset: 0;
  z-index: 50;
  overflow-y: auto;
  background: var(--bg);
}

.done__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: calc(24px + env(safe-area-inset-top)) 20px calc(20px + env(safe-area-inset-bottom));
}

.screen {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  text-align: center;
  animation: enter 360ms var(--ease) both;
}

.h1 {
  color: var(--gold-ink);
  font-size: 2rem;
  font-weight: 900;
}

.h1--orange { color: var(--orange); }

.tiles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
}

.tile {
  overflow: hidden;
  border: 2px solid var(--tile);
  border-radius: var(--r-lg);
  background: var(--tile);
  animation: pop 420ms var(--spring) both;
}

.tile__label {
  padding: 4px 6px;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tile__value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 6px;
  border-radius: 14px 14px 0 0;
  background: var(--surface);
  color: var(--tile);
  font-size: 1.25rem;
  font-weight: 900;
}

.sub {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-weight: 800;
}

.sub--heart { color: var(--red-ink); }
.sub--gems { color: var(--blue-ink); }

.flame__icon {
  animation: flame-in 700ms var(--spring) both, flame-flicker 1.6s 700ms ease-in-out infinite;
  transform-origin: 50% 100%;
}

@keyframes flame-in {
  from { transform: scale(0.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes flame-flicker {
  0%, 100% { transform: scale(1) rotate(0deg); }
  33% { transform: scale(1.05, 0.96) rotate(-2deg); }
  66% { transform: scale(0.97, 1.04) rotate(2deg); }
}

.big {
  color: var(--orange);
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  width: 100%;
  padding: 14px;
  border: 2px solid var(--line);
  border-radius: var(--r-xl);
}

.week__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--text-subtle);
  font-size: 0.82rem;
  font-weight: 800;
}

.week__dot {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--surface-3);
}

.week__dot svg { width: 20px; height: 20px; }
.week__day--on .week__dot { background: var(--orange); }
.week__day--today { color: var(--orange); }
.week__day--today .week__dot { box-shadow: 0 0 0 3px var(--orange-soft); animation: pop 600ms 400ms var(--spring) both; }

.awards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  text-align: left;
}

.award {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  animation: enter 400ms var(--ease) both;
}

.award__badge {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 16px;
}

.award__badge--quest { background: var(--gold-soft); }
.award__title { font-weight: 900; }
.award__text { color: var(--text-muted); font-size: 0.88rem; }

.done__btn { margin-top: 20px; }
</style>
