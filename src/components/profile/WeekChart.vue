<script setup lang="ts">
import { computed } from 'vue';
import { lastDays, weekdayIndex, WEEKDAYS_SHORT } from '@/core/dates';

const props = defineProps<{ xpByDay: Record<string, number>; goal: number; today: string }>();

const days = computed(() => lastDays(7, props.today).map((day) => ({
  day,
  label: WEEKDAYS_SHORT[weekdayIndex(day)],
  xp: props.xpByDay[day] ?? 0,
  today: day === props.today,
})));

const max = computed(() => Math.max(props.goal, ...days.value.map((d) => d.xp), 10));
const total = computed(() => days.value.reduce((s, d) => s + d.xp, 0));
const goalPct = computed(() => (props.goal / max.value) * 100);
</script>

<template>
  <div class="chart">
    <div class="chart__head">
      <p class="chart__title">Опыт за неделю</p>
      <p class="chart__total nums">{{ total }} XP</p>
    </div>
    <div class="chart__plot" role="img" :aria-label="`Опыт за 7 дней: ${days.map((d) => `${d.label} ${d.xp}`).join(', ')}`">
      <div class="chart__goal" :style="{ bottom: `${goalPct}%` }"><span>цель</span></div>
      <div v-for="d in days" :key="d.day" class="chart__col">
        <span v-if="d.xp" class="chart__val nums">{{ d.xp }}</span>
        <div
          class="chart__bar"
          :class="{ 'chart__bar--today': d.today, 'chart__bar--goal': d.xp >= goal }"
          :style="{ height: `${Math.max(d.xp ? 6 : 2, (d.xp / max) * 100)}%` }"
        />
      </div>
    </div>
    <div class="chart__labels">
      <span v-for="d in days" :key="d.day" :class="{ today: d.today }">{{ d.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.chart__title { font-weight: 900; }
.chart__total { color: var(--gold-ink); font-weight: 900; }

.chart__plot {
  position: relative;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  height: 130px;
  padding-top: 18px;
}

.chart__goal {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 2px dashed var(--line-strong);
  pointer-events: none;
}

.chart__goal span {
  position: absolute;
  right: 0;
  top: -18px;
  color: var(--text-subtle);
  font-size: 0.72rem;
  font-weight: 800;
}

.chart__col {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.chart__val {
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
}

.chart__bar {
  width: 100%;
  max-width: 34px;
  border-radius: 8px 8px 4px 4px;
  background: var(--surface-3);
  transition: height 600ms var(--spring);
}

.chart__bar--goal { background: var(--gold); }
.chart__bar--today { background: var(--orange); }

.chart__labels {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-top: 6px;
  color: var(--text-subtle);
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
}

.chart__labels .today { color: var(--orange); }
</style>
