<script setup lang="ts">
import {settingsOutline} from "ionicons/icons";
import {IonToolbar, IonTitle, IonIcon, useIonRouter} from '@ionic/vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const ionRouter = useIonRouter();

const toSettings = (): void => {
  ionRouter.push('/settings');
}
</script>

<template>
  <ion-toolbar>
    <div class="toolbar">
      <ion-title>{{ title }}</ion-title>
      <ion-button fill="clear" color="dark" @click="toSettings">
        <ion-icon :icon="settingsOutline" size="large"></ion-icon>
      </ion-button>
    </div>
  </ion-toolbar>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-right: 20px;
}
</style>