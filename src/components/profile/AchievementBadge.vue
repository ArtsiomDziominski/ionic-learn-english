<script setup lang="ts">
import type { AchievementView } from '@/core/achievements';
import GameIcon from '@/components/ui/GameIcon.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

defineProps<{ view: AchievementView }>();
</script>

<template>
  <div class="ach" :class="{ 'ach--locked': view.tier === 0 }">
    <span class="ach__badge" :style="{ background: view.tier ? view.def.color : undefined }">
      <GameIcon :name="view.def.icon" :size="34" :muted="view.tier === 0" />
      <span v-if="view.tier" class="ach__tier">{{ view.tier }}</span>
    </span>
    <div class="grow">
      <p class="ach__title">{{ view.def.title }}</p>
      <p class="ach__text">{{ view.next !== null ? view.def.describe(view.next) : 'Все уровни пройдены!' }}</p>
      <div v-if="view.next !== null" class="ach__bar">
        <ProgressBar :value="view.ratio" :height="10" color="var(--gold)" :shine="false" />
        <span class="nums">{{ view.value }}/{{ view.next }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ach {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 2px solid var(--line);
}

.ach:last-child { border-bottom: none; }

.ach__badge {
  position: relative;
  display: grid;
  place-items: center;
  width: 62px;
  height: 66px;
  flex-shrink: 0;
  border-radius: 18px;
  background: var(--surface-3);
  box-shadow: inset 0 -5px 0 rgba(0, 0, 0, 0.14);
}

.ach__tier {
  position: absolute;
  bottom: -6px;
  padding: 0 7px;
  border: 2px solid var(--surface);
  border-radius: var(--r-pill);
  background: var(--text);
  color: var(--bg);
  font-size: 0.72rem;
  font-weight: 900;
}

.ach__title { font-weight: 900; }

.ach__text {
  color: var(--text-muted);
  font-size: 0.88rem;
}

.ach__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: var(--text-subtle);
  font-size: 0.78rem;
  font-weight: 800;
}

.ach--locked .ach__title { color: var(--text-muted); }
</style>
