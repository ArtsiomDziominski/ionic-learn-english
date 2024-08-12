<template>
  <div class="cards">
    <CardWord
        class="cards__card"
        :class="colorCards[index] === colorError ? 'cards__error' : colorCards[index] === colorSuccess ? 'cards__success' : ''"
        :color="colorCards[index]"
        v-for="(word, index) in cards"
        :key="word.word"
        :word="word.word"
        @click="chooseWord(word, index)"
    />
  </div>
</template>

<script setup lang="ts">
import CardWord from "@/components/words/card/CardWord.vue";
import {onMounted, ref, Ref, UnwrapRef} from "vue";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";

const storeWords = wordsStore();
const {cards, randomWord} = storeToRefs(storeWords);

const wordSelected = ref('');
const colorCards: Ref<UnwrapRef<string[]>> = ref([]);
const colorError: Ref<UnwrapRef<string>> = ref('danger');
const colorSuccess: Ref<UnwrapRef<string>> = ref('success');

onMounted(() => {
  storeWords.setNextWord();
  setDefault();
})

const chooseWord = (word: COMMON.Word, index: number): void => {
  if (wordSelected.value) return;
  let timeout = 2000;
  wordSelected.value = word.word;

  const indexRandomWord = cards.value.findIndex((card: COMMON.Word) => (card.word === randomWord.value.word));
  colorCards.value[indexRandomWord] = colorSuccess.value;
  if (randomWord.value.word !== word.word) {
    timeout = 3000;
    colorCards.value[index] = colorError.value;
  }

  setTimeout(() => {
    storeWords.setNextWord();
    setDefault();
  }, timeout);
}

const setDefault = (): void => {
  colorCards.value = cards.value.map(() => ('medium'));
  wordSelected.value = '';
}
</script>

<style scoped lang="scss">
.cards {
  width: 100%;
  display: flex;
  flex-direction: column;

  &__card {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.9);
    }
  }

  &__success {
    animation: pulse 0.5s ease forwards;
  }

  &__error {
    animation: shake 0.5s ease forwards;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
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