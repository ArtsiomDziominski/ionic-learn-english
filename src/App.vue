<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
    <AppToasts />
    <ImportSheet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, useBackButton, useIonRouter } from '@ionic/vue';
import { watch } from 'vue';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { planNotifications } from '@/core/reminders';
import { cancelNotifications, requestNotifications, scheduleNotifications } from '@/utils/notifications';
import { useSettingsStore } from '@/store/settings';
import { useProgressStore } from '@/store/progress';
import AppToasts from '@/components/ui/AppToasts.vue';
import ImportSheet from '@/components/ImportSheet.vue';

const settings = useSettingsStore();
const progress = useProgressStore();
const ionRouter = useIonRouter();

settings.init();
progress.init();

/* ——— Уведомления ———————————————————————————————————————————
   Пока приложение открыто, уведомлений нет. Ушло в фон — ставим
   одно напоминание на завтрашний вечер и, если жизней мало, одно
   «жизни восстановились». Вернулось — снимаем. */
if (Capacitor.isNativePlatform()) {
  const plan = (): void => {
    if (!settings.settings.reminders) {
      void cancelNotifications();
      return;
    }
    void scheduleNotifications(planNotifications({
      now: new Date(),
      hearts: progress.state.hearts,
      heartsEnabled: progress.heartsEnabled,
      streak: progress.streak,
    }));
  };

  void cancelNotifications();
  CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) void cancelNotifications();
    else plan();
  });

  watch(() => settings.settings.reminders, (on) => {
    if (!on) void cancelNotifications();
  });

  /* Разрешение спрашиваем не при запуске, а после первого урока,
     когда человек уже понял, зачем ему напоминания. Один раз. */
  watch(() => progress.lessonsDone, (done) => {
    if (done >= 1 && settings.settings.reminders) void requestNotifications();
  }, { immediate: true });
}

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
