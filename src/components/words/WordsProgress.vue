<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages title="Обучение"/>
      <div class="progress">
        <div class="progress__fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </ion-header>

    <ion-content v-if="!isCompleted" :fullscreen="true">
      <div class="study">
        <div v-if="selectedCardView !== ViewCardWords.Match" class="study__prompt">
          <button type="button" class="study__word" @click="speak">
            <span>{{ titleRandomWord }}</span>
            <ion-icon :icon="volumeMediumOutline" class="study__speaker" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="study__favorite"
            :class="{ 'study__favorite--on': isFavorite }"
            :aria-pressed="isFavorite"
            :aria-label="isFavorite ? 'Убрать из избранного' : 'В избранное'"
            @click="setFavorite"
          >
            <ion-icon :icon="isFavorite ? bookmark : bookmarkOutline" />
          </button>
        </div>

        <div class="study__card">
          <component :is="selectedCardViewWord"/>
        </div>
      </div>
    </ion-content>

    <ion-content v-else :fullscreen="true">
      <WordsStudyCompeted/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {computed, watch} from "vue";
import {storeToRefs} from "pinia";
import {wordsStore} from "@/store/words";
import {IonContent, IonHeader, IonPage, IonIcon, useIonRouter, onIonViewDidEnter, onIonViewDidLeave} from '@ionic/vue';
import {bookmark, bookmarkOutline, volumeMediumOutline} from "ionicons/icons";
import {VIEW_WORDS_TRANSLATION, ViewCardWords} from "@/const/flow";
import {settingsStore} from "@/store/settings";
import WordsStudyCompeted from "@/components/words/WordsStudyCompeted.vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import {vocabularyStore} from "@/store/vocabulary";
import {statisticsStore} from "@/store/statistics";

const storeWords = wordsStore();
const {
  currentWord,
  selectedCardView,
  selectedCardViewWord,
  studyWords,
  isCompleted,
  progressBarStudyCount
} = storeToRefs(storeWords);

const storeSettings = settingsStore();
const storeVocabulary = vocabularyStore();
const storeStatistics = statisticsStore();
const {favoritesWords} = storeToRefs(storeVocabulary);
const ionRouter = useIonRouter();

onIonViewDidEnter(() => {
  storeStatistics.loadStatistics();
  if (!currentWord.value) ionRouter.push('/words');
})

onIonViewDidLeave(() => {
  storeWords.resetFlow();
})

watch(isCompleted, (value) => {
  if (value) {
    storeVocabulary.updateStudiedList(studyWords.value);
    storeStatistics.addStudyDay();
  }
})

const titleRandomWord = computed((): string => {
  return VIEW_WORDS_TRANSLATION.includes(selectedCardView.value)
      ? currentWord.value?.translation
      : currentWord.value?.word;
})

const progressPercent = computed((): number => {
  return Math.min(Math.max(progressBarStudyCount.value * 100, 0), 100);
})

const isFavorite = computed((): boolean => {
  return !!favoritesWords.value.find((item) => item.word === currentWord.value?.word);
})

const speak = (): void => {
  storeSettings.speakText(currentWord.value?.word || '');
}

const setFavorite = (): void => {
  if (!currentWord.value) return;
  if (isFavorite.value) storeVocabulary.deleteFavoritesWord(currentWord.value);
  else storeVocabulary.updateFavoritesWord(currentWord.value);
}
</script>

<style scoped lang="scss">
/* Полоса прогресса собственная, а не ion-progress-bar: нужна
   плавная анимация ширины и радиус без ковыряния в shadow parts */
.progress {
  height: 4px;
  background: var(--app-surface-3);

  &__fill {
    height: 100%;
    background: var(--ion-color-primary);
    border-radius: 0 var(--app-r-pill) var(--app-r-pill) 0;
    transition: width var(--app-dur-slow) var(--app-ease);
  }
}

/* Слово и варианты — единая группа по центру экрана.
   Раньше карточки растягивались на остаток высоты и «отрывались»
   от слова, оставляя пустоту сверху и снизу. */
.study {
  max-width: 600px;
  min-height: 100%;
  margin: 0 auto;
  padding: var(--app-sp-4);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--app-sp-5);

  &__prompt {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--app-sp-2);
    padding: var(--app-sp-6) 56px;
    min-height: 96px;
  }

  /* Слово целиком — одна кнопка озвучки: большая цель для пальца
     вместо мелкой иконки */
  &__word {
    display: inline-flex;
    align-items: center;
    gap: var(--app-sp-3);
    border: 0;
    padding: var(--app-sp-2) var(--app-sp-3);
    border-radius: var(--app-r-md);
    background: transparent;
    color: var(--app-text);
    font-family: inherit;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-align: center;
    overflow-wrap: anywhere;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color var(--app-dur-fast) var(--app-ease);

    &:active {
      background: var(--app-surface-2);
    }
  }

  &__speaker {
    flex: 0 0 auto;
    font-size: 22px;
    color: var(--app-text-subtle);
  }

  &__favorite {
    position: absolute;
    top: var(--app-sp-3);
    right: 0;
    width: var(--app-tap);
    height: var(--app-tap);
    display: grid;
    place-items: center;
    border: 0;
    padding: 0;
    border-radius: var(--app-r-md);
    background: transparent;
    color: var(--app-text-subtle);
    font-size: 22px;
    cursor: pointer;
    transition: color var(--app-dur-base) var(--app-ease),
                background-color var(--app-dur-fast) var(--app-ease),
                transform var(--app-dur-base) var(--app-ease-spring);

    &:active {
      transform: scale(0.9);
    }

    &--on {
      color: var(--app-warning-ink);
      background: var(--app-tint-warning);
    }
  }

  &__card {
    display: flex;
    justify-content: center;

    > * {
      width: 100%;
    }
  }
}
</style>
