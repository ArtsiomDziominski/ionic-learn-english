<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getWord, type BankWord } from '@/core/course';
import { shuffle, type Exercise } from '@/core/lessonBuilder';
import type { CheckResult } from '@/store/lesson';
import { useSpeech } from '@/composables/useSpeech';
import { useSound } from '@/composables/useSound';
import { hapticError, hapticSuccess, hapticTap } from '@/composables/useHaptics';

const props = defineProps<{ exercise: Exercise; locked: boolean }>();
const emit = defineEmits<{ ready: [value: boolean]; submit: [result: CheckResult] }>();

const { speak } = useSpeech();
const { play } = useSound();

interface Tile {
  id: string;
  label: string;
}

const words = computed(() => (props.exercise.pairIds ?? []).map((id) => getWord(id)).filter((w): w is BankWord => !!w));
const left = ref<Tile[]>([]);
const right = ref<Tile[]>([]);
const picked = ref<{ side: 'l' | 'r'; id: string } | null>(null);
const matched = ref<Set<string>>(new Set());
const wrong = ref<Set<string>>(new Set());

onMounted(() => {
  emit('ready', false);
  left.value = shuffle(words.value.map((w) => ({ id: w.id, label: w.word })));
  right.value = shuffle(words.value.map((w) => ({ id: w.id, label: w.translation })));
});

const key = (side: 'l' | 'r', id: string): string => `${side}:${id}`;

const tap = (side: 'l' | 'r', tile: Tile): void => {
  if (props.locked || matched.value.has(tile.id)) return;
  hapticTap();
  if (side === 'l') void speak(tile.label);
  else play('tap');

  const p = picked.value;
  if (!p || p.side === side) {
    picked.value = p && p.side === side && p.id === tile.id ? null : { side, id: tile.id };
    return;
  }

  if (p.id === tile.id) {
    const next = new Set(matched.value);
    next.add(tile.id);
    matched.value = next;
    picked.value = null;
    play('match');
    hapticSuccess();
    if (next.size === words.value.length) {
      window.setTimeout(() => emit('submit', { correct: true }), 450);
    }
    return;
  }

  // Неверная пара: подсвечиваем обе плитки красным и сбрасываем выбор
  const flash = new Set([key(p.side, p.id), key(side, tile.id)]);
  wrong.value = flash;
  picked.value = null;
  hapticError();
  window.setTimeout(() => {
    if (wrong.value === flash) wrong.value = new Set();
  }, 520);
};

const stateOf = (side: 'l' | 'r', tile: Tile): string => {
  if (matched.value.has(tile.id)) return 'matched';
  if (wrong.value.has(key(side, tile.id))) return 'wrong';
  if (picked.value?.side === side && picked.value.id === tile.id) return 'selected';
  return '';
};

defineExpose({ check: () => null });
</script>

<template>
  <div class="ex">
    <h2 class="ex__title">Соедините пары</h2>
    <div class="cols">
      <div class="col" role="group" aria-label="Английские слова">
        <button
          v-for="t in left"
          :key="t.id"
          type="button"
          class="tile"
          :class="`tile--${stateOf('l', t)}`"
          :disabled="matched.has(t.id)"
          lang="en"
          @click="tap('l', t)"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="col" role="group" aria-label="Переводы">
        <button
          v-for="t in right"
          :key="t.id"
          type="button"
          class="tile"
          :class="`tile--${stateOf('r', t)}`"
          :disabled="matched.has(t.id)"
          @click="tap('r', t)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ex {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.ex__title {
  font-size: 1.5rem;
  font-weight: 900;
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tile {
  min-height: 58px;
  padding: 10px 12px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: 0 4px 0 var(--line);
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 800;
  word-break: break-word;
  cursor: pointer;
  transition: transform 90ms ease, box-shadow 90ms ease, border-color 120ms ease, background-color 120ms ease, opacity 300ms ease;
}

.tile:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--line);
}

.tile--selected {
  border-color: var(--blue);
  background: var(--blue-soft);
  box-shadow: 0 4px 0 var(--blue);
  color: var(--blue-ink);
}

.tile--wrong {
  border-color: var(--red);
  background: var(--red-soft);
  box-shadow: 0 4px 0 var(--red);
  color: var(--red-ink);
  animation: shake 380ms ease;
}

.tile--matched {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: none;
  color: var(--green-ink);
  opacity: 0.5;
  cursor: default;
  animation: pop 320ms var(--spring);
}
</style>
