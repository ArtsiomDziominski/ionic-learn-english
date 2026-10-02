<script setup lang="ts">
import { computed } from 'vue';
import { useTransfer } from '@/composables/useTransfer';
import { useProgressStore } from '@/store/progress';
import { summarize } from '@/core/progress';
import { formatDayLong, dayKey } from '@/core/dates';
import AppSheet from '@/components/ui/AppSheet.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import type { GameIconName } from '@/art/icons';

/**
 * Подтверждение импорта: показываем, что в файле и что сейчас,
 * и даём выбрать — объединить (по умолчанию, ничего не теряется)
 * или заменить текущий прогресс файлом.
 */
const { pending, applyImport, cancelImport } = useTransfer();
const progress = useProgressStore();

const current = computed(() => summarize(progress.state));
const incoming = computed(() => pending.value?.summary ?? null);
const exported = computed(() => (pending.value?.exportedAt ? formatDayLong(dayKey(new Date(pending.value.exportedAt))) : null));

const rows = computed(() => {
  if (!incoming.value) return [];
  const list: Array<{ icon: GameIconName; label: string; file: number; now: number }> = [
    { icon: 'bolt', label: 'Опыт, XP', file: incoming.value.xp, now: current.value.xp },
    { icon: 'flame', label: 'Серия', file: incoming.value.streak, now: current.value.streak },
    { icon: 'book', label: 'Слов выучено', file: incoming.value.words, now: current.value.words },
    { icon: 'trophy', label: 'Уроков пройдено', file: incoming.value.lessons, now: current.value.lessons },
  ];
  return list;
});
</script>

<template>
  <AppSheet :open="!!pending" label="Загрузка прогресса" @close="cancelImport">
    <template v-if="incoming">
      <h2 class="title">Загрузить прогресс?</h2>
      <p class="muted lead">
        Файл ученика <b>{{ incoming.name }}</b><template v-if="exported">, сохранён {{ exported }}</template>.
      </p>

      <table class="cmp">
        <thead>
          <tr><th /><th>В файле</th><th>Сейчас</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.label">
            <th scope="row"><GameIcon :name="r.icon" :size="22" /> {{ r.label }}</th>
            <td class="nums">{{ r.file }}</td>
            <td class="nums">{{ r.now }}</td>
          </tr>
        </tbody>
      </table>

      <div class="actions">
        <button type="button" class="btn btn--block btn--green" @click="applyImport('merge')">Объединить</button>
        <p class="hint">Выученные слова и уроки сложатся, ничего не потеряется.</p>
        <button type="button" class="btn btn--block btn--secondary danger" @click="applyImport('replace')">Заменить текущий</button>
        <p class="hint">Текущий прогресс на этом устройстве будет заменён файлом.</p>
        <button type="button" class="btn btn--block btn--ghost" @click="cancelImport">Отмена</button>
      </div>
    </template>
  </AppSheet>
</template>

<style scoped>
.title { font-size: 1.35rem; }
.lead { margin: 4px 0 14px; }

.cmp {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.cmp th,
.cmp td {
  padding: 8px 4px;
  border-bottom: 2px solid var(--line);
  text-align: right;
}

.cmp thead th {
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

.cmp tbody th {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  text-align: left;
}

.cmp td {
  font-weight: 900;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hint {
  margin-bottom: 8px;
  color: var(--text-subtle);
  font-size: 0.85rem;
  text-align: center;
}

.danger {
  --btn-fg: var(--red-ink);
}
</style>
