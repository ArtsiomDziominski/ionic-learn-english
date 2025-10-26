<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Словарь" />
    </ion-header>
    <ion-content :fullscreen="true">
      <VocabularyList />
      <AppFooter/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent } from '@ionic/vue';
import { onMounted } from 'vue';
import VocabularyList from "@/components/vocabulary/VocabularyList.vue";
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useSEO } from '@/composables/useSEO';

onMounted(() => {
  useSEO({
    title: 'Мой словарь английских слов | Слова.Day',
    description: 'Ваш персональный словарь для изучения английского языка. Отслеживайте прогресс, повторяйте слова и расширяйте свой словарный запас эффективно.',
    keywords: 'словарь английского, мой словарь, изученные слова, английский словарь, vocabulary list',
    url: 'https://www.learnenglisheasy.ru/vocabulary'
  });
});
</script>
