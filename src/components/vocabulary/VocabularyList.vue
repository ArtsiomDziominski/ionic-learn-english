<script setup lang="ts">
import {IonIcon, useIonRouter} from '@ionic/vue';
import {bookmarkOutline, checkboxOutline, listOutline} from "ionicons/icons";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";
import {computed, onMounted} from "vue";
import {VocabularyViews} from "@/const/vocabulary";
import {vocabularyStore} from "@/store/vocabulary";

const storeWords = wordsStore();
const {countAllWords} = storeToRefs(storeWords);
const storeVocabulary = vocabularyStore();
const {countStudiedWords, countFavoritesWords} = storeToRefs(storeVocabulary);

const ionRouter = useIonRouter();

onMounted(() => {
  storeVocabulary.setStudiedWords();
  storeVocabulary.setFavoritesWord();
});

const titles = {
  allWords: 'Все слова',
  studiedWords: 'Изучены',
  favoritesWords: 'Избранное'
} as { [key: string]: string };

const contents = computed((): {
  colorIcon: string;
  colorText: string;
  icon: string;
  count: number;
  title: string;
  view: VocabularyViews;
}[] => {
  return [
    {
      title: 'allWords',
      icon: listOutline,
      colorText: 'light',
      colorIcon: 'primary',
      count: countAllWords.value,
      view: VocabularyViews.AllVocabulary
    },
    {
      title: 'studiedWords',
      icon: checkboxOutline,
      colorText: 'light',
      colorIcon: 'success',
      count: countStudiedWords.value,
      view: VocabularyViews.StudiedWords
    },
    {
      title: 'favoritesWords',
      icon: bookmarkOutline,
      colorText: 'light',
      colorIcon: 'warning',
      count: countFavoritesWords.value,
      view: VocabularyViews.FavoritesWords
    }
  ]
});

const setVocabularyView = (view: VocabularyViews): void => {
  storeVocabulary.setVocabularyView(view);
  ionRouter.push('/vocabulary/list');
}
</script>

<template>
  <div>
    <ion-card
        class="card"
        v-for="content in contents"
        :key="content.title"
        @click="setVocabularyView(content.view)"
    >
      <ion-button :color="content.colorText" fill="clear">
        <ion-text class="title">
          <ion-icon :icon="content.icon" :color="content.colorIcon"></ion-icon>
          <h2>{{ titles[content.title] }}</h2>
        </ion-text>
        <ion-text class="count" color="medium">{{ content.count }}</ion-text>
      </ion-button>
    </ion-card>
  </div>

</template>

<style scoped lang="scss">
ion-card-content {
  display: grid;
  grid-template-columns: 1fr min-content;
  align-items: center;
}

ion-text {
  font-size: 36px;
  display: flex;
  align-items: center;
  gap: 16px;
}

ion-button {
  width: 100%;
}

.title {
  margin-right: auto;
}

.count {
  margin-left: auto;
}
</style>