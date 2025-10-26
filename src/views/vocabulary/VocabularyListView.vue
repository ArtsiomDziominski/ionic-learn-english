<script setup lang="ts">
import {IonContent, IonHeader, IonPage, IonIcon} from "@ionic/vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import AppFooter from "@/components/AppFooter.vue";
import {vocabularyStore} from "@/store/vocabulary";
import {storeToRefs} from "pinia";
import {addCircleOutline, bookmarkOutline, checkmarkCircleOutline} from "ionicons/icons";
import {onMounted} from "vue";

const storeVocabulary = vocabularyStore();
const {vocabularyList, studiedWords, isStudiedView, favoritesWords} = storeToRefs(storeVocabulary);

onMounted(() => storeVocabulary.setStudiedWords());

const checkStudiedWord = (word: COMMON.Word): boolean => {
  return isStudiedView.value || !!studiedWords.value.find((item) => item.word === word.word);
}

const checkFavorite = (word: COMMON.Word): boolean => {
  return !!favoritesWords.value.find((item) => item.word === word.word);
}

const actionStudied = (word: COMMON.Word, isStudied: boolean): void => {
  if (isStudied) storeVocabulary.deleteStudiedWords(word);
  else storeVocabulary.updateStudiedWords(word);
}

const actionFavorite = (word: COMMON.Word, isFavorite: boolean): void => {
  if (isFavorite) storeVocabulary.deleteFavoritesWord(word);
  else storeVocabulary.updateFavoritesWord(word);
}

</script>

<template>
  <ion-page class="page">
    <ion-header class="header">
      <HeaderToolbarPages title="Словарь"/>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-card v-for="item in vocabularyList" :key="item.word">
        <ion-text class="word">
          {{ item.word }}
        </ion-text>
        <ion-text class="translation">
          {{ item.translation }}
        </ion-text>

        <ion-button
            class="button-favorite"
            fill="clear"
            size="large"
            @click="actionFavorite(item, checkFavorite(item))"
        >
          <ion-icon class="icon" :icon="bookmarkOutline" :color="checkFavorite(item) ? 'warning' : 'medium'"/>
        </ion-button>

        <ion-button
            class="button-studied"
            fill="clear"
            size="large"
            @click="actionStudied(item, checkStudiedWord(item))"
        >
          <ion-icon v-if="checkStudiedWord(item)" class="icon" :icon="checkmarkCircleOutline" color="success"/>
          <ion-icon v-else class="icon" :icon="addCircleOutline" color="medium"/>
        </ion-button>

      </ion-card>
      <AppFooter/>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
ion-card {
  padding: 10px 16px;
  display: grid;
  grid-template-columns: 1fr min-content min-content;
  grid-template-rows: repeat(2, 1fr);
  gap: 6px;

  .word {
    font-size: 28px;
    grid-area: 1/1/2/2;
    align-self: flex-end;
  }

  .translation {
    font-size: 16px;
    grid-area: 2/1/3/2;
  }

  .button-favorite {
    grid-area: 1/2/3/3;
    --color: transparent;
  }

  .button-studied {
    grid-area: 1/3/3/4;
    --color: transparent;
  }

  .icon {
    width: 50px;
    height: 50px;
    cursor: pointer;
  }
}
</style>