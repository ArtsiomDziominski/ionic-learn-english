<script setup lang="ts">
import {chevronBackOutline} from "ionicons/icons";
import {IonTitle, IonToolbar, IonIcon, useIonRouter} from '@ionic/vue';

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const ionRouter = useIonRouter();

const toBack = (): void => {
  ionRouter.back();
}

</script>

<template>
  <ion-toolbar>
    <div class="toolbar">
      <ion-button icon @click="toBack">
        <ion-icon :icon="chevronBackOutline" size="large"></ion-icon>
      </ion-button>
      <ion-title>{{ title }}</ion-title>
    </div>
  </ion-toolbar>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>