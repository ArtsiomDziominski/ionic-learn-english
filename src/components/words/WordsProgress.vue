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
    </ion-header>
    <ion-content class="ion-padding page__content" :fullscreen="true">
      <div class="content">
        <ion-text class="content__title">
          <h1>{{ randomWord?.word }}</h1>
        </ion-text>
        <div class="content__card">
          <component :is="viewCardSelectWord" />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import {storeToRefs} from "pinia";
import {wordsStore} from "@/store/words";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonIcon} from '@ionic/vue';
import {chevronBackOutline} from "ionicons/icons";
import {useRouter} from "vue-router";

const router = useRouter();
const storeWords = wordsStore();
const {cards, randomWord, viewCardSelectWord} = storeToRefs(storeWords);

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

const toBack = (): void => {
  router.back();
}
</script>

<style scoped lang="scss">
.page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    &__toolbar {
      .toolbar {
        display: flex;
        flex-direction: row;
      }
    }
  }

  .content {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 2fr;

    &__title {
      grid-area: 1/1/2/2;
      justify-self: center;
      align-self: center;
    }

    &__card {
      grid-area: 2/1/3/2;
    }
  }
}
</style>