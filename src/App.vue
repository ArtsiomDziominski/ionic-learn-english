<template>
  <ion-app>
    <ion-router-outlet :animated="true" />
    <AppNotifications />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import {onMounted} from "vue";
import {settingsStore} from "@/store/settings";
import AppNotifications from "@/components/AppNotifications.vue";

const storeSettings = settingsStore();

onMounted(() => {
  storeSettings.initSettings();
})
</script>
