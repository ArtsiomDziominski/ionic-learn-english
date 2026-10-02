<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { getWord } from '@/core/course';
import { shuffle, type Exercise } from '@/core/lessonBuilder';
import type { CheckResult } from '@/store/lesson';
import { useSound } from '@/composables/useSound';
import { hapticTap } from '@/composables/useHaptics';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import SpeechBubble from '@/components/ui/SpeechBubble.vue';

const props = defineProps<{ exercise: Exercise; locked: boolean; result: CheckResult | null }>();
const emit = defineEmits<{ ready: [value: boolean] }>();

const { play } = useSound();

const word = computed(() => getWord(props.exercise.wordId));
const letters = computed(() => [...(word.value?.word ?? '')]);
const bank = ref<Array<{ key: number; ch: string }>>([]);
const placed = ref<number[]>([]);

onMounted(() => {
  // Перемешиваем, пока порядок не перестанет совпадать со словом
  let order = shuffle(letters.value.map((ch, key) => ({ key, ch })));
  for (let i = 0; i < 5 && order.map((t) => t.ch).join('') === word.value?.word; i++) order = shuffle(order);
  bank.value = order;
  emit('ready', false);
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

const isPlaced = (key: number): boolean => placed.value.includes(key);

const take = (key: number): void => {
  if (props.locked || isPlaced(key)) return;
  placed.value = [...placed.value, key];
  play('tap');
  hapticTap();
  emit('ready', placed.value.length === letters.value.length);
};

const giveBack = (index: number): void => {
  if (props.locked) return;
  placed.value = placed.value.filter((_, i) => i !== index);
  emit('ready', false);
};

/** С клавиатуры: буква выбирает плитку, Backspace возвращает последнюю. */
function onKey(e: KeyboardEvent): void {
  if (props.locked || e.ctrlKey || e.metaKey) return;
  if (e.key === 'Backspace' && placed.value.length) {
    giveBack(placed.value.length - 1);
    return;
  }
  if (e.key.length !== 1) return;
  const tile = bank.value.find((t) => !isPlaced(t.key) && t.ch.toLowerCase() === e.key.toLowerCase());
  if (tile) take(tile.key);
}

const answer = computed(() => placed.value.map((k) => letters.value[k]).join(''));

defineExpose({
  check: (): CheckResult | null => {
    if (placed.value.length !== letters.value.length || !word.value) return null;
    return { correct: answer.value.toLowerCase() === word.value.word.toLowerCase(), answer: word.value.word };
  },
});
</script>

<template>
  <div v-if="word" class="ex">
    <h2 class="ex__title">Соберите слово</h2>

    <div class="say">
      <LexiMascot mood="think" :size="110" />
      <SpeechBubble class="say__bubble"><span class="say__text">{{ word.translation }}</span></SpeechBubble>
    </div>

    <div class="answer" :class="{ 'answer--correct': locked && result?.correct, 'answer--wrong': locked && result && !result.correct }" aria-live="polite">
      <button
        v-for="(key, i) in placed"
        :key="`p-${key}`"
        type="button"
        class="tile tile--placed"
        :disabled="locked"
        @click="giveBack(i)"
      >
        {{ letters[key] }}
      </button>
      <span v-for="n in letters.length - placed.length" :key="`gap-${n}`" class="slot" aria-hidden="true" />
    </div>

    <div class="bank" role="group" aria-label="Буквы">
      <button
        v-for="t in bank"
        :key="t.key"
        type="button"
        class="tile"
        :class="{ 'tile--used': isPlaced(t.key) }"
        :disabled="locked || isPlaced(t.key)"
        :aria-label="`Буква ${t.ch}`"
        @click="take(t.key)"
      >
        {{ isPlaced(t.key) ? '' : t.ch }}
      </button>
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

.say {
  display: flex;
  align-items: center;
  gap: 14px;
}

.say__bubble { flex: 1; }

.say__text {
  font-size: 1.4rem;
  font-weight: 900;
}

.answer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 6px;
  min-height: 72px;
  padding: 10px 6px;
  border-bottom: 2px solid var(--line);
}

.answer--correct .tile--placed {
  border-color: var(--green);
  color: var(--green-ink);
  background: var(--green-soft);
}

.answer--wrong {
  animation: shake 380ms ease;
}

.answer--wrong .tile--placed {
  border-color: var(--red);
  color: var(--red-ink);
  background: var(--red-soft);
}

.slot {
  width: 40px;
  height: 4px;
  margin-bottom: 6px;
  border-radius: var(--r-pill);
  background: var(--line-strong);
}

.bank {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.tile {
  display: grid;
  place-items: center;
  min-width: 46px;
  height: 52px;
  padding: 0 10px;
  border: 2px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface);
  box-shadow: 0 4px 0 var(--line);
  color: var(--text);
  font-size: 1.35rem;
  font-weight: 900;
  cursor: pointer;
  transition: transform 90ms ease, box-shadow 90ms ease;
}

.tile:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--line);
}

.tile--placed {
  animation: pop 220ms var(--spring);
}

.tile--used {
  background: var(--surface-3);
  border-color: var(--surface-3);
  box-shadow: none;
  cursor: default;
}
</style>
