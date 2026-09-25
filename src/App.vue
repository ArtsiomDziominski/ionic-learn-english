<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
    <AppNotifications />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter } from '@ionic/vue';
import { onMounted } from 'vue';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { settingsStore } from '@/store/settings';
import AppNotifications from '@/components/AppNotifications.vue';

const storeSettings = settingsStore();
const ionRouter = useIonRouter();

onMounted(() => {
  storeSettings.initSettings();
});

/* Аппаратная кнопка «назад» на Android.
   Переходы между экранами Ionic обрабатывает сам с приоритетом 0,
   а вот на корневом экране ничего не происходило: кнопка выглядела
   сломанной. Отрицательный приоритет ставит наш обработчик в конец
   цепочки — он сработает, только если возвращаться уже некуда. */
useBackButton(-1, () => {
  if (!Capacitor.isNativePlatform()) return;
  if (!ionRouter.canGoBack()) {
    CapacitorApp.exitApp();
  }
});
</script>
