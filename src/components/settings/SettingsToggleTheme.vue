<script setup lang="ts">
import {settingsStore} from "@/store/settings";
import {storeToRefs} from "pinia";
import {personCircle, personCircleOutline, sunny, sunnyOutline} from "ionicons/icons";
import { IonIcon } from '@ionic/vue';

const storeSettings = settingsStore();
const {isDarkMode} = storeToRefs(storeSettings);

const toggleMode = () => {
  storeSettings.toggleMode();
};
</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button default-href="#"></ion-back-button>
      </ion-buttons>
      <ion-title>Display</ion-title>
      <ion-buttons slot="end">
        <ion-button color="dark">
          <ion-icon slot="icon-only" :ios="personCircleOutline" :md="personCircle"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-list-header>Appearance</ion-list-header>
    <ion-list :inset="true">
      <ion-item :button="true">Text Size</ion-item>
      <ion-item>
        <ion-toggle :checked="isDarkMode" @ion-change="toggleMode" justify="space-between">Dark mode</ion-toggle>
      </ion-item>
    </ion-list>

    <ion-list-header>Brightness</ion-list-header>
    <ion-list :inset="true">
      <ion-item>
        <ion-range value="40">
          <ion-icon :icon="sunnyOutline" slot="start"></ion-icon>
          <ion-icon :icon="sunny" slot="end"></ion-icon>
        </ion-range>
      </ion-item>
      <ion-item>
        <ion-toggle justify="space-between" checked>True Tone</ion-toggle>
      </ion-item>
    </ion-list>

    <ion-list :inset="true">
      <ion-item :button="true">
        <ion-label>Night Shift</ion-label>
        <ion-text slot="end" color="medium">9:00 PM to 8:00 AM</ion-text>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style scoped lang="scss">

</style>