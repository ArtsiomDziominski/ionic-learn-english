<script setup lang="ts">
import {checkmarkCircleOutline} from "ionicons/icons";
import {IonIcon, useIonRouter} from '@ionic/vue';
import AppConfetti from "@/components/AppConfetti.vue";
import {computed} from "vue";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";

const ionRouter = useIonRouter();
const storeWords = wordsStore();
const {currentFlow} = storeToRefs(storeWords);

const praiseArray = [
  "Отлично!",
  "Вау!",
  "Хорошая работа!",
  "Здорово!",
  "Класс!",
  "Молодец!",
  "Прекрасно!",
  "Супер!",
  "Впечатляюще!",
  "Отличная работа!",
  "Потрясающе!",
  "Замечательно!",
  "Великолепно!"
];

const randomTitle = computed(() => praiseArray[Math.floor(Math.random() * (praiseArray.length + 0.5))])

const toSetFlow = (): void => {
  storeWords.resetFlow();
  storeWords.initializeWordsList(currentFlow.value);
  ionRouter.push('/tabs/words/progress');
}
const toHome = (): void => {
  storeWords.resetFlow();
  ionRouter.push('/tabs/words');
}

</script>

<template>
  <div class="words-study">
    <ion-icon :icon="checkmarkCircleOutline" size="large" color="medium"/>
    <ion-text class="title">
      {{ randomTitle }}
    </ion-text>
    <ion-text class="description">
      Вы успешно изучили слова! Продолжайте в том же духе
    </ion-text>
    <div class="buttons">
      <ion-button shape="round" @click="toSetFlow">Продолжить</ion-button>
      <ion-button shape="round" fill="outline" @click="toHome">Выйти</ion-button>
    </div>
    <AppConfetti/>
  </div>
</template>

<style scoped lang="scss">
.words-study {
  height: 100%;
  display: grid;
  grid-template-rows: repeat(4, min-content) 1fr;
  justify-items: center;
  padding: 30px 10px;

  .title {
    font-size: 36px;
  }

  .description {
    font-size: 16px;
  }

  .buttons {
    grid-area: 5/1/6/2;
    display: flex;
    flex-direction: column;
    align-self: flex-end;
  }

  ion-text {
    margin: 20px 0;
    text-align: center;
  }
  ion-button {
    margin: 10px 0;
  }
}
</style>