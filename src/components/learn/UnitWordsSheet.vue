<script setup lang="ts">
import { computed } from 'vue';
import type { CourseUnit } from '@/core/course';
import { getWord } from '@/core/course';
import { useProgressStore } from '@/store/progress';
import { useSpeech } from '@/composables/useSpeech';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';

const props = defineProps<{ open: boolean; unit: CourseUnit | null }>();
defineEmits<{ close: [] }>();

const progress = useProgressStore();
const { speak, available } = useSpeech();

const rows = computed(() =>
  (props.unit?.words ?? []).map((id) => ({ id, word: getWord(id), learned: progress.learnedSet.has(id) })));
const learned = computed(() => rows.value.filter((r) => r.learned).length);
</script>

<template>
  <AppSheet :open="open" :label="unit ? `Слова: ${unit.title}` : 'Слова'" @close="$emit('close')">
    <template v-if="unit">
      <h2 class="title">{{ unit.title }}</h2>
      <p class="muted lead">Выучено {{ learned }} из {{ rows.length }}</p>
      <ul class="words">
        <li v-for="r in rows" :key="r.id" class="w" :class="{ 'w--learned': r.learned }">
          <button v-if="available" type="button" class="w__say" :aria-label="`Произнести ${r.word?.word}`" @click="speak(r.word?.word ?? '')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          </button>
          <div class="grow">
            <p class="w__en">{{ r.word?.word }}</p>
            <p class="w__ru">{{ r.word?.translations.join(', ') }}</p>
          </div>
          <GameIcon v-if="r.learned" name="check" :size="24" label="Выучено" />
        </li>
      </ul>
    </template>
  </AppSheet>
</template>

<style scoped>
.title { font-size: 1.35rem; }
.lead { margin: 2px 0 12px; }

.words {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.w {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 2px;
  border-bottom: 2px solid var(--line);
}

.w:last-child { border-bottom: none; }

.w__en { font-weight: 900; }
.w__ru { color: var(--text-muted); font-size: 0.9rem; }

.w__say {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--r-md);
  background: var(--blue-soft);
  color: var(--blue);
  cursor: pointer;
}

.w__say svg { width: 22px; height: 22px; }
</style>
