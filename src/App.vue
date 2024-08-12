<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import {onMounted} from "vue";
import {STORAGE_KEY_THEME, ThemeType} from "@/const/const";
import {settingsStore} from "@/store/settings";

const storeSettings = settingsStore();

onMounted(() => {
  const theme = (localStorage.getItem(STORAGE_KEY_THEME) as ThemeType);
  storeSettings.setMode(theme || ThemeType.Dark);
})
</script>
