<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { getWord } from '@/core/course';
import { checkTyped } from '@/core/answers';
import type { Exercise } from '@/core/lessonBuilder';
import type { CheckResult } from '@/store/lesson';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import SpeechBubble from '@/components/ui/SpeechBubble.vue';

const props = defineProps<{ exercise: Exercise; locked: boolean; result: CheckResult | null }>();
const emit = defineEmits<{ ready: [value: boolean] }>();

const word = computed(() => getWord(props.exercise.wordId));
const value = ref('');
const input = ref<HTMLInputElement | null>(null);

watch(value, (v) => emit('ready', v.trim().length > 0));

onMounted(async () => {
  emit('ready', false);
  await nextTick();
  // Без задержки клавиатура на телефоне иногда не открывается
  window.setTimeout(() => input.value?.focus({ preventScroll: true }), 250);
});

defineExpose({
  check: (): CheckResult | null => {
    if (!word.value || !value.value.trim()) return null;
    const { verdict } = checkTyped(value.value, [word.value.word]);
    return { correct: verdict !== 'wrong', typo: verdict === 'typo', answer: word.value.word };
  },
});
</script>

<template>
  <div v-if="word" class="ex">
    <h2 class="ex__title">Напишите по-английски</h2>

    <div class="say">
      <LexiMascot mood="think" :size="110" />
      <SpeechBubble class="say__bubble"><span class="say__text">{{ word.translation }}</span></SpeechBubble>
    </div>

    <label class="sr-only" for="type-answer">Ваш ответ</label>
    <input
      id="type-answer"
      ref="input"
      v-model="value"
      class="field answer"
      :class="{ 'answer--correct': locked && result?.correct, 'answer--wrong': locked && result && !result.correct }"
      type="text"
      lang="en"
      inputmode="text"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="done"
      placeholder="Введите слово"
      :readonly="locked"
    />
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
  min-height: 64px;
  font-size: 1.3rem;
  font-weight: 800;
}

.answer--correct {
  border-color: var(--green);
  background: var(--green-soft);
  color: var(--green-ink);
}

.answer--wrong {
  border-color: var(--red);
  background: var(--red-soft);
  color: var(--red-ink);
  animation: shake 380ms ease;
}
</style>
