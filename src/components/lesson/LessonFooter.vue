<script setup lang="ts">
import { computed } from 'vue';
import type { CheckResult, LessonPhase } from '@/store/lesson';

const props = defineProps<{
  phase: LessonPhase;
  result: CheckResult | null;
  canCheck: boolean;
  /** Карточка нового слова — вместо «Проверить» кнопка «Понятно». */
  intro: boolean;
  /** Сопоставление проверяется само — кнопка не нужна. */
  auto: boolean;
}>();

const emit = defineEmits<{ check: []; continue: []; intro: [] }>();

const PRAISE = ['Отлично!', 'Верно!', 'Здорово!', 'Так держать!', 'Супер!', 'Великолепно!', 'Точно!'];
const praise = computed(() => PRAISE[Math.floor(Math.random() * PRAISE.length)]);

const answered = computed(() => props.phase === 'correct' || props.phase === 'wrong');

const onMain = (): void => {
  if (answered.value) emit('continue');
  else if (props.intro) emit('intro');
  else emit('check');
};
</script>

<template>
  <footer class="lf" :class="{ 'lf--correct': phase === 'correct', 'lf--wrong': phase === 'wrong' }">
    <div class="lf__inner">
      <Transition name="fb">
        <div v-if="answered" class="lf__feedback" role="status" aria-live="assertive">
          <span class="lf__badge" aria-hidden="true">
            <svg v-if="phase === 'correct'" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" /></svg>
          </span>
          <div class="lf__text">
            <template v-if="phase === 'correct'">
              <p class="lf__title">{{ result?.typo ? 'Почти! Опечатка' : praise }}</p>
              <p v-if="result?.typo" class="lf__answer">Правильно: <b>{{ result.answer }}</b></p>
            </template>
            <template v-else>
              <p class="lf__title">Правильный ответ:</p>
              <p class="lf__answer"><b>{{ result?.answer }}</b></p>
            </template>
          </div>
        </div>
      </Transition>

      <button
        v-if="!auto || answered"
        type="button"
        class="btn btn--lg lf__btn"
        :class="{ 'btn--green': phase === 'correct' || (!answered && !intro), 'btn--red': phase === 'wrong', 'btn--blue': intro && !answered }"
        :disabled="!answered && !intro && !canCheck"
        @click="onMain"
      >
        {{ answered ? (phase === 'wrong' ? 'Понятно' : 'Далее') : intro ? 'Понятно' : 'Проверить' }}
      </button>
    </div>
  </footer>
</template>

<style scoped>
.lf {
  border-top: 2px solid var(--line);
  background: var(--bg);
  transition: background-color 200ms ease, border-color 200ms ease;
}

.lf--correct {
  border-top-color: transparent;
  background: var(--green-soft);
}

.lf--wrong {
  border-top-color: transparent;
  background: var(--red-soft);
}

.lf__inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
}

.lf__feedback {
  display: flex;
  align-items: center;
  gap: 14px;
}

.lf__badge {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--surface);
}

.lf__badge svg { width: 32px; height: 32px; }
.lf--correct .lf__badge { color: var(--green); }
.lf--wrong .lf__badge { color: var(--red); }

.lf__title {
  font-size: 1.35rem;
  font-weight: 900;
}

.lf--correct .lf__title,
.lf--correct .lf__answer { color: var(--green-ink); }
.lf--wrong .lf__title,
.lf--wrong .lf__answer { color: var(--red-ink); }

.lf__answer { font-size: 1.05rem; }

.lf__btn { width: 100%; }

@media (min-width: 720px) {
  .lf__inner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .lf__btn {
    width: auto;
    min-width: 180px;
    margin-left: auto;
  }
}

.fb-enter-active { animation: fb-in 260ms var(--spring) both; }

@keyframes fb-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
