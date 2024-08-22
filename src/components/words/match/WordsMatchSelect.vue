<script setup lang="ts">
import WordsMatchCard from "@/components/words/match/WordsMatchCard.vue";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";
import {computed, Ref, ref, UnwrapRef} from "vue";
import {settingsStore} from "@/store/settings";

const storeWords = wordsStore();
const {cards} = storeToRefs(storeWords);

const storeSettings = settingsStore();

const selected: Ref<UnwrapRef<string[][]>> = ref([]);
const selectedErrorWord: Ref<UnwrapRef<string>> = ref('');
const selectedErrorWordTimeout: Ref<UnwrapRef<NodeJS.Timeout | null>> = ref(null);

const wordsList = computed(() => cards.value.map((w) => w.word).sort(() => Math.random() - 0.5));
const translationsList = computed(() => cards.value.map((t) => t.translation).sort(() => Math.random() - 0.5));

const selectWord = (word: string): void => {
  storeSettings.speakText(word);
  setWordList(word);
}

const selectTranslation = (translation: string): void => {
  setWordList(translation);
}

const selectedLastElements = computed((): string[] | undefined => {
  return selected.value.at(-1);
})

const setWordList = (value: string): void => {
  selectedErrorWord.value = '';
  if (selectedLastElements.value?.length === 1 && selectedLastElements.value?.includes(value)) selected.value.pop();
  else if (selected.value.some((s) => s.includes(value))) return;
  else if (selected.value.every((s) => s.length === 2)) selected.value.push([value]);
  else {
    const lastSelectedWord = selectedLastElements.value?.[0] || '';
    const word = cards.value.find((w => w.word === lastSelectedWord));
    const translation = cards.value.find((w => w.translation === lastSelectedWord));
    actionsSelectedList(word, translation, value);
  }
  nextWord();
}

const actionsSelectedList = (word: COMMON.Word | undefined, translation: COMMON.Word | undefined, value: string): void => {
  if (selectedErrorWordTimeout.value) clearTimeout(selectedErrorWordTimeout.value);
  const selectedLastElements = selected.value.at(-1);
  if (word && word?.translation === value) selectedLastElements?.push(value);
  else if (translation && translation?.word === value) selectedLastElements?.push(value);
  else if (
      (/[А-Яа-яЁё]/.test(selectedLastElements?.[0] || '') && /[А-Яа-яЁё]/.test(value)) ||
      (!/[А-Яа-яЁё]/.test(selectedLastElements?.[0] || '') && !/[А-Яа-яЁё]/.test(value))
  ) {
    selected.value.pop();
    selected.value.push([value]);
  } else {
    selectedErrorWord.value = value;
    selectedErrorWordTimeout.value = setTimeout(() => selectedErrorWord.value = '', 3000);
  }
}

const getColorCard = (word: string): string => {
  if (selected.value.some((s) => s.length === 2 && s.includes(word))) return 'success';
  else if (selected.value.some((s) => s.includes(word))) return 'primary';
  else if (selectedErrorWord.value === word) return 'danger';
  else return '';
}

const nextWord = (): void => {
  if (selected.value.length === 4 && selected.value.at(-1)?.length === 2) {
    setTimeout(() => storeWords.setNextWord(), 3000);
    storeWords.setAnswer(null, true);
  }
}
</script>

<template>
  <div class="match">
    <div>
      <WordsMatchCard
          class="match__word"
          :class="word === selectedErrorWord ? 'match__error' : ''"
          v-for="word in wordsList"
          :key="word"
          :word="word"
          :color="getColorCard(word)"
          @click="selectWord(word)"
      />
    </div>
    <div>
      <WordsMatchCard
          class="match__translation"
          :class="translation === selectedErrorWord ? 'match__error' : ''"
          v-for="translation in translationsList"
          :key="translation"
          :word="translation"
          :color="getColorCard(translation)"
          @click="selectTranslation(translation)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.match {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, min-content);
  gap: 6px 10px;

  &__word {
    grid-column: 1/2;
  }

  &__translation {
    grid-column: 2/3;
  }

  &__error {
    animation: shake 0.4s ease forwards;
  }
}

@keyframes shake {
  0% {
    transform: translateX(-10px);
  }
  25% {
    transform: translateX(10px);
  }
  50% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>