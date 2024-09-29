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
      <h1>{{ title }}</h1>
      <ion-button fill="clear" color="light" @click="toSettings">
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

h1 {
  font-size: 20px;
  padding: 0 20px;
}
</style>