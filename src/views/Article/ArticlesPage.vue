<script setup lang="ts">
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter} from "@ionic/vue";
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import ArticleCardPreview from "@/components/blog/ArticleCardPreview.vue";
import {useHead} from "@vueuse/head";

const ionRouter = useIonRouter();

const articles: Ref<UnwrapRef<ARTICLE.Article[]>> = ref([])
const articlesCount = 6;

onMounted(async () => {
  setMeta();
  const response = await fetch('/articles/list.json');
  const articlesList = await response.json();

  for (const title of articlesList.slice(0, articlesCount)) {
    const response = await fetch(`/articles/${title}.json`);
    const data = await response.json();
    articles.value.push(data);
  }
})

const setArticle = (article: ARTICLE.Article): void => {
  ionRouter.push(`/article/${article.id}`);
}

const setMeta = () => {
  useHead({
    title: 'Статьи для изучения английского языка',
    meta: [
      {
        name: 'description',
        content: 'Узнайте лучшие статьи и ресурсы для изучения английского языка. Полезные советы, методы и рекомендации для всех уровней.'
      },
      {
        property: 'og:title',
        content: 'Статьи для изучения английского языка'
      },
      {
        property: 'og:description',
        content: 'Изучайте английский язык с помощью наших статей. Рекомендуем эффективные методы и ресурсы для достижения ваших целей.'
      },
      {
        property: 'og:type',
        content: 'article'
      },
      {
        property: 'og:url',
        content: window.location.href
      },
      {
        property: 'og:image',
        content: 'URL_изображения_для_статьи'
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: 'Статьи для изучения английского языка'
      },
      {
        name: 'twitter:description',
        content: 'Полезные статьи и советы по изучению английского языка для начинающих и продвинутых студентов.'
      },
      {
        name: 'twitter:image',
        content: 'URL_изображения_для_статьи'
      },
      {
        name: 'keywords',
        content: 'английский язык, изучение английского, статьи, ресурсы, советы по изучению английского'
      }
    ]
  })

}
</script>

<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Полезные статьи для изучения английского языка" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="preview-wrapper">
        <ArticleCardPreview v-for="article in articles" :key="article.title" :article="article" @click="setArticle(article)"/>
      </div>

    </ion-content>
  </ion-page>
</template>

<style>
.preview-wrapper {
  max-width: 1440px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin: 0 auto;

  @media screen and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
</style>

