<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages title="Настройки"/>
    </ion-header>
    <ion-content :fullscreen="true">
      <SettingsToggleTheme/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonContent, IonHeader} from '@ionic/vue';
import { onMounted } from 'vue';
import SettingsToggleTheme from "@/components/settings/SettingsToggleTheme.vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import { useSEO } from '@/composables/useSEO';

onMounted(() => {
  useSEO({
    title: 'Настройки | Слова.Day',
    description: 'Настройте приложение для изучения английского языка под себя. Выберите тему оформления и другие параметры для комфортного обучения.',
    url: 'https://www.learnenglisheasy.ru/settings'
  });
});
</script>

<style scoped lang="scss">
</style>
