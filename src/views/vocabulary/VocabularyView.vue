<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Vocabulary words" />
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <VocabularyList />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import VocabularyList from "@/components/vocabulary/VocabularyList.vue";
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
</script>
