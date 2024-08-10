<template>
  <div class="letter-select">
    <div v-if="isCardLetters" class="letter-select__header header">
      <ion-text class="header__text">
        {{ textFormWord }}
      </ion-text>
      <ion-icon class="header__delete" :icon="backspaceOutline" size="large" @click="clearLastSelectedLetter()"></ion-icon>
    </div>
    <div v-if="isCardLetters" class="letter-select__card">
      <template
          v-for="(letter) in lettersRandom"
          :key="letter.letter"
      >
        <LetterCard
            v-if="letter.counter !== letter.selected"
            :letter="letter.letter"
            :count="letter.counter - letter.selected"
            @click="selectLetter(letter.letter)"
        />
        <ion-icon v-else :icon="radioButtonOffOutline" size="small"/>
      </template>
    </div>
    <div class="letter-select__result result">
      <Transition name="bounce">
        <ion-text v-show="isCorrectWord" class="result__translation">
          {{ randomWord?.word }}
        </ion-text>
      </Transition>
      <Transition name="slide-fade">
        <ion-button v-show="isCorrectTranslation" class="result__translation" @click="clickNext">
          Next
        </ion-button>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, Ref, ref, UnwrapRef, watch} from "vue";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";
import LetterCard from "@/components/words/letter/LetterCard.vue";
import {backspaceOutline, radioButtonOffOutline} from "ionicons/icons";
import {IonIcon} from "@ionic/vue";

const storeWords = wordsStore();
const {randomWord} = storeToRefs(storeWords);

const lettersRandom: Ref<UnwrapRef<{ letter: string; selected: number; counter: number }[]>> = ref([]);
const lettersSelected: Ref<UnwrapRef<string[]>> = ref([]);

const isCorrectWord: Ref<UnwrapRef<boolean>> = ref(false);
const isCorrectTranslation: Ref<UnwrapRef<boolean>> = ref(false);
const isCardLetters: Ref<UnwrapRef<boolean>> = ref(true);

onMounted(() => {
  storeWords.setNextWord();
  setDefault();
})

watch(randomWord, () => {
  const randomLettersList = randomWord.value?.word
      .split('')
      .sort(() => Math.random() - 0.5)

  lettersRandom.value = randomLettersList.reduce((acc: {
    letter: string,
    selected: number,
    counter: number
  }[], letter: string) => {
    const existing = acc.find((item) => item.letter === letter);

    if (existing) existing.counter += 1;
    else acc.push({
      letter: letter,
      selected: 0,
      counter: 1
    });

    return acc;
  }, []);

  console.log(lettersSelected);
})

const textFormWord = computed((): string => {
  const repeatForm = randomWord.value?.word ? randomWord.value.word.length - lettersSelected.value.length : 0;
  return lettersSelected.value.join('') + ' _ '.repeat(repeatForm);
})

const selectLetter = (letter: string): void => {
  lettersSelected.value.push(letter);
  lettersRandom.value.forEach((l) => {
    if (l.letter === letter) l.selected++;
  });

  if (randomWord.value?.word.length === lettersSelected.value.length) {
    const checkingWord = lettersSelected.value.join('');
    isCorrectWord.value = true;

    if (randomWord.value.word === checkingWord) {
      isCardLetters.value = false;
      setTimeout(() => {
        storeWords.setNextWord();
        setDefault();
      }, 5000);
    } else {
      isCorrectTranslation.value = true;
    }
  }
}

const setDefault = (): void => {
  lettersSelected.value = [];
  isCorrectWord.value = false;
  isCorrectTranslation.value = false;
  isCardLetters.value = true;
}

const clearLastSelectedLetter = (): void => {
  if (!lettersSelected.value.length) return;
  const lastSelectedLetter = lettersSelected.value.pop();
  if (lastSelectedLetter) lettersRandom.value.forEach((l) => {
    if (l.letter === lastSelectedLetter) {
      l.selected--;
    }
  });
}

const clickNext = (): void => {
  storeWords.setNextWord();
  setDefault();
}

</script>

<style scoped lang="scss">
.letter-select {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__header {
    display: flex;
    flex-direction: row;
    gap: 4px;

    .header {
      &__text {
        font-size: 20px;
      }

      &__delete {
        cursor: pointer;
      }
    }
  }

  &__card {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 40px 0 10px 0;
    gap: 20px;
  }

  .result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    &__word {
      font-size: 36px;
    }

    &__translation {
      font-size: 48px;
      padding: 15px 30px;
      border-radius: 50px;
      background-color: #2dd55b;
    }
  }
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

</style>