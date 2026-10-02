<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
    <AppToasts />
    <ImportSheet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter } from '@ionic/vue';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useSettingsStore } from '@/store/settings';
import { useProgressStore } from '@/store/progress';
import AppToasts from '@/components/ui/AppToasts.vue';
import ImportSheet from '@/components/ImportSheet.vue';

const settings = useSettingsStore();
const progress = useProgressStore();
const ionRouter = useIonRouter();

settings.init();
progress.init();

/* Аппаратная кнопка «назад» на Android.
   Переходы между экранами Ionic обрабатывает сам с приоритетом 0,
   а вот на корневом экране ничего не происходило: кнопка выглядела
   сломанной. Отрицательный приоритет ставит наш обработчик в конец
   цепочки — он сработает, только если возвращаться уже некуда. */
useBackButton(-1, () => {
  if (!Capacitor.isNativePlatform()) return;
  if (!ionRouter.canGoBack()) {
    progress.saveNow();
    CapacitorApp.exitApp();
  }
});
</script>
