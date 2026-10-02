<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProgressStore } from '@/store/progress';
import StatPill from '@/components/ui/StatPill.vue';
import type { CourseSection } from '@/core/course';

defineProps<{ section: CourseSection }>();
defineEmits<{ open: [panel: 'section' | 'streak' | 'gems' | 'hearts'] }>();

const progress = useProgressStore();
const { streak, activeToday, hearts, heartsEnabled, state } = storeToRefs(progress);
</script>

<template>
  <div class="topbar">
    <button type="button" class="course" :aria-label="`Раздел: ${section.title}. Сменить`" @click="$emit('open', 'section')">
      <span class="course__badge">{{ section.badge }}</span>
      <span class="course__title">{{ section.kind === 'topics' ? 'Темы' : section.title }}</span>
      <svg class="course__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>

    <div class="stats">
      <StatPill
        icon="flame"
        :value="streak"
        :muted="!activeToday"
        color="var(--paper-ink)"
        :label="`Серия: ${streak}`"
        @click="$emit('open', 'streak')"
      />
      <StatPill icon="gem" :value="state.gems" color="var(--paper-ink)" :label="`Кристаллы: ${state.gems}`" @click="$emit('open', 'gems')" />
      <StatPill
        icon="heart"
        :value="heartsEnabled ? hearts : '∞'"
        color="var(--paper-ink)"
        :label="heartsEnabled ? `Жизни: ${hearts}` : 'Жизни без ограничений'"
        @click="$emit('open', 'hearts')"
      />
    </div>
  </div>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: 6px 12px;
}

.course {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: var(--tap);
  min-width: 0;
  padding: 4px 12px 4px 4px;
  border: 2px solid var(--paper-line);
  border-radius: var(--r-pill);
  background: var(--paper);
  color: var(--paper-ink);
  cursor: pointer;
}

/* Значок раздела — листик */
.course__badge {
  display: grid;
  place-items: center;
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border-radius: 4px 50% 4px 50%;
  background: linear-gradient(150deg, #6CC35F, var(--leaf-shade));
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.74rem;
  font-weight: 700;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3);
}

.course__title {
  overflow: hidden;
  font-weight: 800;
  font-size: 0.92rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.course__chev {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--paper-muted);
}

.stats {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 2px;
  border: 2px solid var(--paper-line);
  border-radius: var(--r-pill);
  background: var(--paper);
}

.stats :deep(.pill) {
  min-height: 40px;
}

.stats :deep(.pill:hover),
.stats :deep(.pill:focus-visible) {
  background: var(--leaf-soft);
}

@media (max-width: 380px) {
  .course__title {
    display: none;
  }
}
</style>
