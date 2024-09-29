<template>
  <ion-page class="page">
    <ion-header class="header">
      <HeaderToolbarPages title="Обучение"/>
      <ion-progress-bar :buffer="0" :value="progressBarStudyCount"></ion-progress-bar>
    </ion-header>
    <ion-content v-if="!isCompleted" class="ion-padding page__content" :fullscreen="true">
      <div class="content">
        <ion-text v-if="selectedCardView !== ViewCardWords.Match" class="content__title" @click="speck">
          {{ titleRandomWord }}
          <ion-icon :icon="volumeMediumOutline" size="large" color="medium"/>
        </ion-text>
        <ion-button
            v-if="selectedCardView !== ViewCardWords.Match"
            class="content__button-favorite"
            fill="clear"
            size="large"
            @click="setFavorite"
        >
          <ion-icon
              class="icon"
              :icon="bookmarkOutline"
              :color="isFavorite ? 'warning' : 'medium'"
          />
        </ion-button>
        <div class="content__card">
          <component :is="selectedCardViewWord"/>
        </div>
      </div>
    </ion-content>
    <ion-content v-else>
      <WordsStudyCompeted/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, Ref, ref, UnwrapRef, watch} from "vue";
import {storeToRefs} from "pinia";
import {wordsStore} from "@/store/words";
import {IonContent, IonHeader, IonPage, IonIcon, useIonRouter} from '@ionic/vue';
import {bookmarkOutline, volumeMediumOutline} from "ionicons/icons";
import {VIEW_WORDS_TRANSLATION, ViewCardWords} from "@/const/flow";
import {settingsStore} from "@/store/settings";
import WordsStudyCompeted from "@/components/words/WordsStudyCompeted.vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import {vocabularyStore} from "@/store/vocabulary";

const storeWords = wordsStore();
const {
  cards,
  currentWord,
  selectedCardView,
  selectedCardViewWord,
  studyWords,
  isCompleted,
  progressBarStudyCount
} = storeToRefs(storeWords);

const storeSettings = settingsStore();
const storeVocabulary = vocabularyStore();
const {favoritesWords} = storeToRefs(storeVocabulary);
const ionRouter = useIonRouter();

const wordSelected = ref('');
const colorCards: Ref<UnwrapRef<string[]>> = ref([]);

onMounted(() => {
  setDefault();
  if (!currentWord.value) ionRouter.push('/words');
})

onUnmounted(() => {
  storeWords.resetFlow();
})

watch(isCompleted, (value) => {
  if (value) storeVocabulary.updateStudiedList(studyWords.value);
})

const titleRandomWord = computed((): string => {
  return VIEW_WORDS_TRANSLATION.includes(selectedCardView.value)
      ? currentWord.value?.translation
      : currentWord.value?.word;
})

const isFavorite = computed((): boolean => {
  return !!favoritesWords.value.find((item) => item.word === currentWord.value.word);
})

const setDefault = (): void => {
  colorCards.value = cards.value.map(() => ('medium'));
  wordSelected.value = '';
}

const speck = (): void => {
  storeSettings.speakText(currentWord.value.word);
}

const setFavorite = (): void => {
  if (isFavorite.value) storeVocabulary.deleteFavoritesWord(currentWord.value);
  else storeVocabulary.updateFavoritesWord(currentWord.value);
}
</script>

<style scoped lang="scss">
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header {
  }

  &__content {
    .content {
      max-width: 600px;
      height: 100%;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 2fr;
      margin: 0 auto;

      &__title {
        grid-area: 1/1/2/2;
        justify-self: center;
        align-self: center;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 14px;
        font-size: 36px;
        word-break: break-all;
      }

      &__card {
        grid-area: 2/1/3/2;
      }

      &__button-favorite {
        position: absolute;
        top: 70px;
        right: 30px;
      }
    }
  }
}
</style>