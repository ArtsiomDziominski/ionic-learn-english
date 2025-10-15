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
        <ion-text
          v-if="isCorrectWord"
          class="result__word"
          key="word-display"
        >
          {{ currentWord?.word }}
        </ion-text>
      </Transition>
      <Transition name="slide-fade">
        <ion-button
          v-if="isCorrectTranslation"
          class="result__next-button"
          @click="clickNext"
          key="next-button"
        >
          Запомнил
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
import {settingsStore} from "@/store/settings";

const storeWords = wordsStore();
const {currentWord} = storeToRefs(storeWords);

const storeSettings = settingsStore();

const lettersRandom: Ref<UnwrapRef<{ letter: string; selected: number; counter: number }[]>> = ref([]);
const lettersSelected: Ref<UnwrapRef<string[]>> = ref([]);

const isCorrectWord: Ref<UnwrapRef<boolean>> = ref(false);
const isCorrectTranslation: Ref<UnwrapRef<boolean>> = ref(false);
const isCardLetters: Ref<UnwrapRef<boolean>> = ref(true);

onMounted(() => {
  setLettersRandom();
  setDefault();
});

watch(currentWord, () => {
  setLettersRandom();
});

watch(isCorrectTranslation, () => {
  if (!isCorrectTranslation.value) setLettersRandom();

});

const textFormWord = computed((): string => {
  const repeatForm = currentWord.value?.word ? currentWord.value.word.length - lettersSelected.value.length : 0;
  return lettersSelected.value.join('') + ' _ '.repeat(repeatForm);
})

const setLettersRandom = (): void => {
  const randomLettersList = currentWord.value?.word
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
}

const selectLetter = (letter: string): void => {
  lettersSelected.value.push(letter);
  lettersRandom.value.forEach((l) => {
    if (l.letter === letter) l.selected++;
  });

  if (currentWord.value?.word.length === lettersSelected.value.length) {
    const checkingWord = lettersSelected.value.join('');
    isCorrectWord.value = true;
    storeSettings.speakText(currentWord.value?.word || '');

    if (currentWord.value.word === checkingWord) {
      isCardLetters.value = false;
      storeWords.setAnswer(currentWord.value, true);
      setTimeout(() => {
        storeWords.setNextWord();
        setDefault();
      }, 3000);
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
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
    overflow: hidden;

    .header {
      &__text {
        font-size: 40px;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 16px;
      }

      &__delete {
        cursor: pointer;
        flex-shrink: 0;
        min-width: auto;
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
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    &__next-button {
      font-size: 18px;
      font-weight: 500;
      padding: 15px 30px;
      border-radius: 50px;

      &::part(native) {
        color: white;
        box-shadow: 0 4px 8px rgba(45, 213, 91, 0.3);
        transition: all 0.2s ease;
      }

      &:hover::part(native) {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(45, 213, 91, 0.4);
      }
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

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

</style>
