<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { getWord } from '@/core/course';
import type { Exercise } from '@/core/lessonBuilder';
import { useSpeech } from '@/composables/useSpeech';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import SpeechBubble from '@/components/ui/SpeechBubble.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import SpeakButton from './SpeakButton.vue';

const props = defineProps<{ exercise: Exercise }>();
const emit = defineEmits<{ ready: [value: boolean] }>();

const { speak, available } = useSpeech();
const word = computed(() => getWord(props.exercise.wordId));

onMounted(() => {
  emit('ready', true);
  if (word.value) void speak(word.value.word);
});

defineExpose({ check: () => null });
</script>

<template>
  <div v-if="word" class="ex">
    <p class="badge"><GameIcon name="sparkle" :size="22" /> Новое слово</p>

    <div class="say">
      <LexiMascot view="threeQuarter" mood="talk" :size="140" />
      <SpeechBubble class="say__bubble">
        <div class="say__row">
          <SpeakButton v-if="available" @play="speak(word.word)" />
          <span class="word" lang="en">{{ word.word }}</span>
        </div>
      </SpeechBubble>
    </div>

    <div class="meaning card">
      <p class="eyebrow">Перевод</p>
      <p class="meaning__text">{{ word.translations.join(', ') }}</p>
    </div>
  </div>
</template>

<style scoped>
.ex {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--violet-ink);
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.say {
  display: flex;
  align-items: center;
  gap: 16px;
}

.say__bubble { flex: 1; }

.say__row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word {
  font-size: 1.9rem;
  font-weight: 900;
  word-break: break-word;
}

.meaning {
  text-align: center;
  padding: 22px 16px;
  border-bottom-width: 4px;
}

.meaning__text {
  margin-top: 4px;
  font-size: 1.6rem;
  font-weight: 900;
}
</style>
