<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <div class="toolbar">
          <ion-button icon @click="toBack">
            <ion-icon :icon="chevronBackOutline" size="large"></ion-icon>
          </ion-button>
          <ion-title>Settings</ion-title>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <SettingsToggleTheme/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonPage, IonToolbar, IonTitle, IonContent, IonHeader, IonIcon, useIonRouter} from '@ionic/vue';
import SettingsToggleTheme from "@/components/settings/SettingsToggleTheme.vue";
import {chevronBackOutline} from "ionicons/icons";

const ionRouter = useIonRouter();

const toBack = (): void => {
  ionRouter.back();
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
</style>