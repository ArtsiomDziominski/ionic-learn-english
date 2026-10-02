<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/store/progress';
import RingProgress from '@/components/ui/RingProgress.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import { isQuestDone } from '@/core/quests';

defineEmits<{ quests: [] }>();

const progress = useProgressStore();
const { xpToday, goalRatio, state, quests, activeToday, streak } = storeToRefs(progress);

const doneQuests = computed(() => quests.value.filter(isQuestDone).length);
const claimable = computed(() => quests.value.some((q) => isQuestDone(q) && !q.claimed));
const goalDone = computed(() => goalRatio.value >= 1);

const line = computed(() => {
  if (goalDone.value) return 'Цель дня выполнена!';
  if (!activeToday.value && streak.value > 0) return 'Пройдите урок, чтобы продлить серию';
  return `Ещё ${Math.max(0, state.value.dailyGoal - xpToday.value)} XP до цели`;
});
</script>

<template>
  <section class="daily">
    <RingProgress :value="goalRatio" :size="64" :stroke="8" :color="goalDone ? 'var(--gold)' : '#FF8A3D'" track="rgba(255, 138, 61, 0.2)">
      <GameIcon :name="goalDone ? 'trophy' : 'bolt'" :size="26" />
    </RingProgress>
    <div class="daily__text">
      <p class="eyebrow">Цель дня</p>
      <p class="daily__value nums">{{ xpToday }} / {{ state.dailyGoal }} XP</p>
      <p class="daily__line">{{ line }}</p>
    </div>
    <button type="button" class="daily__quests" :class="{ 'daily__quests--ready': claimable }" @click="$emit('quests')">
      <GameIcon name="target" :size="26" />
      <span class="nums">{{ doneQuests }}/{{ quests.length }}</span>
      <span v-if="claimable" class="daily__dot" aria-label="Есть награда" />
    </button>
  </section>
</template>

<style scoped>
/* Бумажная карточка поверх травы */
.daily {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border: 2px solid var(--paper-line);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: var(--paper-shadow);
  color: var(--paper-ink);
}

.daily .eyebrow {
  color: var(--paper-muted);
}

.daily__text {
  flex: 1;
  min-width: 0;
}

.daily__value {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
}

.daily__line {
  color: var(--paper-muted);
  font-size: 0.88rem;
}

.daily__quests {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 64px;
  padding: 8px 10px;
  border: 2px solid var(--paper-line);
  border-radius: var(--r-lg);
  background: var(--paper);
  color: var(--paper-muted);
  font-weight: 900;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 90ms ease, box-shadow 90ms ease;
}

.daily__quests:active {
  transform: scale(0.95);
}

.daily__quests--ready {
  border-color: var(--gold);
  background: var(--gold-soft);
  color: var(--gold-ink);
}

.daily__dot {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 14px;
  height: 14px;
  border: 2px solid var(--paper);
  border-radius: 50%;
  background: var(--red);
}
</style>
