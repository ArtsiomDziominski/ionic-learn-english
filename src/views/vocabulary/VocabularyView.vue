<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Словарь" />
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <VocabularyList />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import { onMounted } from 'vue';
import VocabularyList from "@/components/vocabulary/VocabularyList.vue";
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
import { useSEO } from '@/composables/useSEO';

onMounted(() => {
  useSEO({
    title: 'Мой словарь английских слов | Learn English Easy',
    description: 'Ваш персональный словарь для изучения английского языка. Отслеживайте прогресс, повторяйте слова и расширяйте свой словарный запас эффективно.',
    keywords: 'словарь английского, мой словарь, изученные слова, английский словарь, vocabulary list',
    url: 'https://www.learnenglisheasy.ru/vocabulary'
  });
});
</script>
