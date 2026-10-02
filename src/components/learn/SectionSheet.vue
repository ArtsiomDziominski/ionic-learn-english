<script setup lang="ts">
import { computed } from 'vue';
import { SECTIONS, sectionLessonIds } from '@/core/course';
import { useProgressStore } from '@/store/progress';
import AppSheet from '@/components/ui/AppSheet.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: []; select: [id: string] }>();

const progress = useProgressStore();

const rows = computed(() =>
  SECTIONS.map((s) => {
    const ids = sectionLessonIds(s);
    const done = ids.filter((id) => progress.isLessonDone(id)).length;
    return { s, done, total: ids.length };
  }));

const pick = (id: string): void => {
  emit('select', id);
  emit('close');
};
</script>

<template>
  <AppSheet :open="open" label="Разделы курса" @close="$emit('close')">
    <h2 class="title">Разделы курса</h2>
    <p class="muted lead">Начните с любого уровня — уроки внутри раздела открываются по порядку.</p>
    <ul class="list">
      <li v-for="{ s, done, total } in rows" :key="s.id">
        <button
          type="button"
          class="item card card--press"
          :class="{ 'item--active': s.id === progress.state.sectionId }"
          @click="pick(s.id)"
        >
          <span class="item__badge" :class="{ 'item__badge--topics': s.kind === 'topics' }">{{ s.kind === 'topics' ? 'Т' : s.badge }}</span>
          <span class="item__body">
            <span class="item__title">{{ s.title }} <small>{{ s.english }}</small></span>
            <span class="item__sub">{{ s.subtitle }}</span>
            <ProgressBar :value="total ? done / total : 0" :height="10" :shine="false" />
          </span>
          <span class="item__count nums">{{ done }}/{{ total }}</span>
        </button>
      </li>
    </ul>
  </AppSheet>
</template>

<style scoped>
.title { font-size: 1.35rem; }
.lead { margin: 4px 0 14px; }

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border-radius: var(--r-lg);
  text-align: left;
}

.item--active {
  border-color: var(--violet);
  background: var(--violet-soft);
  box-shadow: 0 4px 0 var(--violet);
}

.item__badge {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  background: var(--violet);
  color: #fff;
  font-weight: 900;
}

.item__badge--topics { background: var(--teal); }

.item__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.item__title { font-weight: 900; }
.item__title small { color: var(--text-subtle); font-weight: 700; }
.item__sub { color: var(--text-muted); font-size: 0.88rem; }
.item__count { color: var(--text-subtle); font-weight: 800; font-size: 0.85rem; }
</style>
