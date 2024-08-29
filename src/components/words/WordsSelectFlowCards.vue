<template>
  <div class="wrapper-flow">
    <ion-button shape="round" @click="redirectToLearnWords(FlowWords.Random)">Все слова</ion-button>
    <ion-card
        class="card"
        :color="card.bg"
        :style="{'--ion-color-base': card.bg}"
        v-for="card in cards"
        :key="card.title"
        @click="redirectToLearnWords(card.title)"
    >
      <ion-card-header class="header">
        <ion-card-title>{{ card.title }}</ion-card-title>
        <ion-icon :icon="caretForwardOutline" size="large"></ion-icon>
      </ion-card-header>
      <ion-card-content> {{ card.description }}</ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import {IonIcon, useIonRouter} from "@ionic/vue";
import {wordsStore} from "@/store/words";
import {caretForwardOutline} from "ionicons/icons";
import {FlowWords} from "@/const/flow";

const ionRouter = useIonRouter();
const storeWords = wordsStore();

const cards = [
  {
    title: FlowWords.A1,
    description: 'Level A1',
    bg: 'primary'
  },
  {
    title: FlowWords.A2,
    description: 'Level A2',
    bg: 'secondary'
  },
  {
    title: FlowWords.B1,
    description: 'Level B1',
    bg: 'tertiary'
  },
  {
    title: FlowWords.B2,
    description: 'Level B2',
    bg: 'warning'
  },
  {
    title: FlowWords.C1,
    description: 'Level C1',
    bg: 'medium'
  },
  {
    title: FlowWords.C2,
    description: 'Level C2',
    bg: 'dark'
  },
  {
    title: FlowWords.Pronoun,
    description: 'Pronoun',
    bg: 'light'
  },
  {
    title: FlowWords.Number,
    description: 'Числа',
    bg: 'var(--ion-color-tertiary-shade)'
  },
  {
    title: FlowWords.Auto,
    description: 'Автомобильная тематика',
    bg: 'var(--ion-color-danger-shade)'
  },
  {
    title: FlowWords.Airport,
    description: 'Ключевые слова в аэропорту',
    bg: 'var(--ion-color-secondary-tint)'
  },
  {
    title: FlowWords.Journey,
    description: 'Путешествие',
    bg: 'var(--ion-color-warning-shade)'
  },
  {
    title: FlowWords.Government,
    description: 'Государственное управление',
    bg: 'var(--ion-color-success-shade)'
  },
  {
    title: FlowWords.Health,
    description: 'Здоровье и медицина',
    bg: 'var(--ion-color-danger)'
  },
  {
    title: FlowWords.Business,
    description: 'Бизнес и экономика',
    bg: 'primary'
  },
  {
    title: FlowWords.Science,
    description: 'Наука и технологии',
    bg: 'secondary'
  },
  {
    title: FlowWords.Food,
    description: 'Еда и напитки',
    bg: 'tertiary'
  },
  {
    title: FlowWords.Culture,
    description: 'Культура и искусство',
    bg: 'warning'
  },
  {
    title: FlowWords.Fitness,
    description: 'Спорт и фитнес',
    bg: 'medium'
  },
  {
    title: FlowWords.Fashion,
    description: 'Покупки и мода',
    bg: 'dark'
  },
  {
    title: FlowWords.Ecology,
    description: 'Окружающая среда и экология',
    bg: 'light'
  },
  {
    title: FlowWords.Socialissues,
    description: 'Социальные вопросы',
    bg: 'var(--ion-color-tertiary-shade)'
  },
  {
    title: FlowWords.Home,
    description: 'Социальные вопросы',
    bg: 'var(--ion-color-danger-shade)'
  }
];

const redirectToLearnWords = (flow: FlowWords): void => {
  storeWords.initializeWordsList(flow);
  ionRouter.push('/tabs/words/progress');
}
</script>

<style scoped lang="scss">
.wrapper-flow {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .card {
    width: 100%;
    transition: transform 0.3s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.99);
    }

    .header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>