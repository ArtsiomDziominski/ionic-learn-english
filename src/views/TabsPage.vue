<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="words" href="/words">
          <ion-icon aria-hidden="true" :icon="albumsOutline" />
          <ion-label>Обучение</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/vocabulary">
          <ion-icon aria-hidden="true" :icon="fileTrayFullOutline" />
          <ion-label>Словарь</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/article">
          <ion-icon aria-hidden="true" :icon="bookOutline" />
          <ion-label>Блог</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { albumsOutline, fileTrayFullOutline, bookOutline } from 'ionicons/icons';
</script>
