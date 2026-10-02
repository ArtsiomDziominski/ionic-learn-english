<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { getWord } from '@/core/course';
import type { ChoiceOption, Exercise } from '@/core/lessonBuilder';
import type { CheckResult } from '@/store/lesson';
import { useSpeech } from '@/composables/useSpeech';
import { useSound } from '@/composables/useSound';
import { hapticTap } from '@/composables/useHaptics';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import SpeechBubble from '@/components/ui/SpeechBubble.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import SpeakButton from './SpeakButton.vue';

const props = defineProps<{ exercise: Exercise; locked: boolean; result: CheckResult | null }>();
const emit = defineEmits<{ ready: [value: boolean] }>();

const { speak, available } = useSpeech();
const { play } = useSound();

const word = computed(() => getWord(props.exercise.wordId));
const options = computed<ChoiceOption[]>(() => props.exercise.options ?? []);
const selected = ref<string | null>(null);

const isListen = computed(() => props.exercise.type === 'listen');
const toRussian = computed(() => props.exercise.direction === 'en-ru' && !isListen.value);

const title = computed(() => {
  if (isListen.value) return 'Что вы слышите?';
  if (toRussian.value) return props.exercise.isNew ? 'Как это переводится?' : 'Выберите перевод';
  return 'Как это по-английски?';
});

const correctLabel = computed(() => options.value.find((o) => o.wordId === props.exercise.wordId)?.label ?? '');
const wide = computed(() => options.value.some((o) => o.label.length > 14));

const choose = (o: ChoiceOption): void => {
  if (props.locked) return;
  selected.value = o.wordId;
  play('tap');
  hapticTap();
  // Английские варианты озвучиваем — так слово запоминается и на слух
  if (!toRussian.value) void speak(o.label);
  emit('ready', true);
};

const stateOf = (o: ChoiceOption): string => {
  if (!props.locked || !props.result) return selected.value === o.wordId ? 'selected' : '';
  if (o.wordId === props.exercise.wordId) return 'correct';
  if (o.wordId === selected.value) return 'wrong';
  return 'dim';
};

const onKey = (e: KeyboardEvent): void => {
  const n = Number(e.key);
  if (n >= 1 && n <= options.value.length && !(e.target instanceof HTMLInputElement)) choose(options.value[n - 1]);
};

onMounted(() => {
  emit('ready', false);
  window.addEventListener('keydown', onKey);
  if (word.value && (isListen.value || toRussian.value)) void speak(word.value.word);
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

defineExpose({
  check: (): CheckResult | null => {
    if (!selected.value) return null;
    return { correct: selected.value === props.exercise.wordId, answer: correctLabel.value };
  },
});
</script>

<template>
  <div v-if="word" class="ex">
    <h2 class="ex__title">{{ title }}</h2>

    <div v-if="isListen" class="listen">
      <SpeakButton size="lg" label="Прослушать слово" @play="speak(word.word)" />
      <SpeakButton size="lg" slow label="Прослушать медленно" @play="speak(word.word, true)" />
    </div>

    <div v-else class="say">
      <LexiMascot :view="toRussian ? 'threeQuarter' : 'front'" :mood="toRussian ? 'talk' : 'think'" :size="120" />
      <SpeechBubble class="say__bubble">
        <div class="say__row">
          <SpeakButton v-if="toRussian && available" @play="speak(word.word)" />
          <span v-if="exercise.isNew" class="say__new"><GameIcon name="sparkle" :size="16" /></span>
          <span class="say__text" :lang="toRussian ? 'en' : 'ru'">{{ toRussian ? word.word : word.translation }}</span>
        </div>
      </SpeechBubble>
    </div>

    <div class="opts" :class="{ 'opts--wide': wide || toRussian }" role="radiogroup" :aria-label="title">
      <button
        v-for="(o, i) in options"
        :key="o.wordId"
        type="button"
        role="radio"
        :aria-checked="selected === o.wordId"
        class="opt"
        :class="`opt--${stateOf(o)}`"
        :disabled="locked"
        @click="choose(o)"
      >
        <span class="opt__num" aria-hidden="true">{{ i + 1 }}</span>
        <span class="opt__label" :lang="toRussian ? 'ru' : 'en'">{{ o.label }}</span>
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

.listen {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 18px;
  padding: 10px 0;
}

.say {
  display: flex;
  align-items: center;
  gap: 14px;
}

.say__bubble { flex: 1; }

.say__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.say__text {
  font-size: 1.5rem;
  font-weight: 900;
  word-break: break-word;
}

.opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.opts--wide {
  grid-template-columns: 1fr;
}

.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 12px 14px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: 0 4px 0 var(--line);
  color: var(--text);
  font-size: 1.12rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
  transition: transform 90ms ease, box-shadow 90ms ease, border-color 120ms ease, background-color 120ms ease;
}

.opt:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--line);
}

.opt:disabled { cursor: default; }

.opt__num {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border: 2px solid var(--line);
  border-radius: 8px;
  color: var(--text-subtle);
  font-size: 0.85rem;
}

.opt__label {
  flex: 1;
  word-break: break-word;
}

.opt--selected {
  border-color: var(--blue);
  background: var(--blue-soft);
  box-shadow: 0 4px 0 var(--blue);
  color: var(--blue-ink);
}

.opt--selected .opt__num { border-color: var(--blue); color: var(--blue-ink); }

.opt--correct {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: 0 4px 0 var(--green);
  color: var(--green-ink);
  animation: pop 360ms var(--spring);
}

.opt--correct .opt__num { border-color: var(--green); color: var(--green-ink); }

.opt--wrong {
  border-color: var(--red);
  background: var(--red-soft);
  box-shadow: 0 4px 0 var(--red);
  color: var(--red-ink);
  animation: shake 380ms ease;
}

.opt--wrong .opt__num { border-color: var(--red); color: var(--red-ink); }

.opt--dim { opacity: 0.55; }

@media (hover: none) {
  .opt__num { display: none; }
}
</style>
