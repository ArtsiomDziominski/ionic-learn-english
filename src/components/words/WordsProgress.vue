<template>
  <ion-page class="page">
    <ion-header class="header">
      <ion-toolbar class="header__toolbar">
        <div class="toolbar">
          <ion-button icon @click="toBack">
            <ion-icon :icon="chevronBackOutline" size="large"></ion-icon>
          </ion-button>
          <ion-title>Tab 1</ion-title>
        </div>
      </ion-toolbar>
      <ion-progress-bar :buffer="0" :value="progressBarStudyCount"></ion-progress-bar>
    </ion-header>
    <ion-content v-if="!isCompleted" class="ion-padding page__content" :fullscreen="true">
      <div class="content">
        <ion-text v-if="selectedCardView !== ViewCardWords.Match" class="content__title" @click="speck">
          {{ titleRandomWord }}
          <ion-icon :icon="volumeMediumOutline" size="large" color="medium"></ion-icon>
        </ion-text>
        <div class="content__card">
          <component :is="selectedCardViewWord" />
        </div>
      </div>
    </ion-content>
    <ion-content v-else>
      <WordsStudyCompeted />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, Ref, ref, UnwrapRef} from "vue";
import {storeToRefs} from "pinia";
import {wordsStore} from "@/store/words";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon} from '@ionic/vue';
import {chevronBackOutline, volumeMediumOutline} from "ionicons/icons";
import {useRouter} from "vue-router";
import {VIEW_WORDS_TRANSLATION, ViewCardWords} from "@/const/flow";
import {settingsStore} from "@/store/settings";
import WordsStudyCompeted from "@/components/words/WordsStudyCompeted.vue";

const router = useRouter();
const storeWords = wordsStore();
const {cards, currentWord, selectedCardView, selectedCardViewWord, isCompleted, progressBarStudyCount} = storeToRefs(storeWords);

const storeSettings = settingsStore();

const wordSelected = ref('');
const colorCards: Ref<UnwrapRef<string[]>> = ref([]);

onMounted(() => {
  setDefault();
})

onUnmounted(() => {
  storeWords.resetFlow();
})

const titleRandomWord = computed((): string => {
  return VIEW_WORDS_TRANSLATION.includes(selectedCardView.value)
      ? currentWord.value?.translation
      : currentWord.value?.word;
})

const setDefault = (): void => {
  colorCards.value = cards.value.map(() => ('medium'));
  wordSelected.value = '';
}

const toBack = (): void => {
  router.back();
}

const speck = (): void => {
  storeSettings.speakText(currentWord.value.word);
}
</script>

<style scoped lang="scss">
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header {
    &__toolbar {
      .toolbar {
        display: flex;
        flex-direction: row;
      }
    }
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
    }
  }
}
</style>