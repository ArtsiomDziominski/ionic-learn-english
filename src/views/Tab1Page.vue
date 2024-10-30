<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Изучать английские слова легко и быстро!" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ChooseFlowCards/>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import ChooseFlowCards from "@/components/words/WordsSelectFlowCards.vue";
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
</script>
