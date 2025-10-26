<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Изучать английские слова легко и быстро!" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ChooseFlowCards/>
      <AppFooter/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { onMounted } from 'vue';
import ChooseFlowCards from "@/components/words/WordsSelectFlowCards.vue";
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useSEO } from '@/composables/useSEO';
import { useWebApplicationSchema } from '@/composables/useStructuredData';

onMounted(() => {
  useSEO({
    title: 'Изучение английских слов онлайн тренажер бесплатно',
    description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений. Карточки, тесты и игры для быстрого запоминания слов. Бесплатный онлайн тренажер для всех уровней.',
    keywords: 'английские слова, изучение английского, тренажер слов, карточки английского, учить слова онлайн, vocabulary trainer, английский бесплатно',
    url: 'https://www.learnenglisheasy.ru/words'
  });

  // Structured Data
  useWebApplicationSchema();
});
</script>
