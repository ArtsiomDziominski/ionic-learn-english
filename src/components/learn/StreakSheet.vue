<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { FREEZE_COST, MAX_FREEZES, useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { useSound } from '@/composables/useSound';
import { WEEKDAYS_SHORT, addDays, plural, weekStart } from '@/core/dates';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const progress = useProgressStore();
const toast = useToastStore();
const { play } = useSound();
const { streak, activeToday, state, today } = storeToRefs(progress);

const week = computed(() => {
  const monday = weekStart(today.value);
  return WEEKDAYS_SHORT.map((label, i) => {
    const day = addDays(monday, i);
    return {
      label,
      day,
      active: (state.value.xpByDay[day] ?? 0) > 0,
      frozen: state.value.streak.frozenDays.includes(day),
      isToday: day === today.value,
      future: day > today.value,
    };
  });
});

const canBuy = computed(() => state.value.gems >= FREEZE_COST && state.value.streak.freezes < MAX_FREEZES);

const buy = (): void => {
  if (progress.buyFreeze()) {
    play('coins');
    toast.show('Заморозка куплена — серия под защитой', 'reward', 'freeze');
  }
};
</script>

<template>
  <AppSheet :open="open" label="Ударный режим" @close="$emit('close')">
    <div class="hero">
      <GameIcon name="flame" :size="88" :muted="!activeToday" class="hero__flame" :class="{ 'hero__flame--on': activeToday }" />
      <div>
        <p class="hero__num nums">{{ streak }}</p>
        <p class="hero__label">{{ plural(streak, 'день', 'дня', 'дней') }} подряд</p>
      </div>
    </div>
    <p class="note">
      {{ activeToday ? 'Сегодня вы уже занимались — серия продлена. Так держать!' : streak > 0 ? 'Пройдите урок сегодня, чтобы не потерять серию.' : 'Пройдите урок, чтобы начать серию.' }}
    </p>

    <div class="week" role="list" aria-label="Эта неделя">
      <div
        v-for="d in week"
        :key="d.day"
        role="listitem"
        class="day"
        :class="{ 'day--active': d.active, 'day--frozen': d.frozen, 'day--today': d.isToday, 'day--future': d.future }"
      >
        <span class="day__label">{{ d.label }}</span>
        <span class="day__dot">
          <GameIcon v-if="d.active" name="flame" :size="22" />
          <GameIcon v-else-if="d.frozen" name="freeze" :size="20" />
        </span>
      </div>
    </div>

    <div class="freeze card">
      <GameIcon name="freeze" :size="44" />
      <div class="grow">
        <p class="freeze__title">Заморозка серии</p>
        <p class="freeze__text">Сохранит серию, если пропустите день. У вас {{ state.streak.freezes }} из {{ MAX_FREEZES }}.</p>
      </div>
      <button type="button" class="btn btn--blue btn--sm" :disabled="!canBuy" @click="buy">
        <GameIcon name="gem" :size="18" /> {{ FREEZE_COST }}
      </button>
    </div>

    <p class="best">Лучшая серия: <b class="nums">{{ state.streak.best }}</b></p>
  </AppSheet>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 8px 0;
}

.hero__flame--on {
  animation: flicker 1.6s ease-in-out infinite;
  transform-origin: 50% 100%;
}

@keyframes flicker {
  0%, 100% { transform: scale(1) rotate(0deg); }
  30% { transform: scale(1.05, 0.97) rotate(-2deg); }
  60% { transform: scale(0.97, 1.04) rotate(2deg); }
}

.hero__num {
  color: var(--orange);
  font-size: 3.4rem;
  font-weight: 900;
  line-height: 1;
}

.hero__label {
  color: var(--orange-ink);
  font-size: 1.1rem;
  font-weight: 800;
}

.note {
  margin: 6px 0 16px;
  color: var(--text-muted);
  text-align: center;
}

.week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.day__label {
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 800;
}

.day__dot {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-3);
}

.day--active .day__dot { background: var(--orange-soft); }
.day--frozen .day__dot { background: var(--blue-soft); }
.day--today .day__dot { box-shadow: 0 0 0 3px var(--orange); }
.day--today .day__label { color: var(--orange-ink); }
.day--future .day__dot { opacity: 0.5; }

.freeze {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.freeze__title { font-weight: 900; }
.freeze__text { color: var(--text-muted); font-size: 0.88rem; }

.best {
  margin-top: 14px;
  color: var(--text-muted);
  text-align: center;
}
</style>
