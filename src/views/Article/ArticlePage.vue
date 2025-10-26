<script setup lang="ts">
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import {useRoute} from "vue-router";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import AppFooter from "@/components/AppFooter.vue";
import {useArticleSEO} from "@/composables/useSEO";
import {useArticleSchema, useBreadcrumbSchema} from "@/composables/useStructuredData";

const route = useRoute();

const article: Ref<UnwrapRef<ARTICLE.Article | null>> = ref(null);

onMounted(async () => {
  const id = route.params.id;
  const response = await fetch(`/articles/${id}.json`);
  article.value = await response.json();
  setMeta();
})

const setMeta = () => {
  if (article.value) {
    // SEO Meta Tags
    useArticleSEO({
      title: article.value.title,
      description: article.value.description,
      img: article.value.img,
      publishedTime: article.value.publishedTime,
      modifiedTime: article.value.modifiedTime,
      author: article.value.author
    });

    // Structured Data
    useArticleSchema({
      headline: article.value.title,
      description: article.value.description,
      image: article.value.img,
      datePublished: article.value.publishedTime,
      dateModified: article.value.modifiedTime,
      author: article.value.author
    });

    // Breadcrumb
    useBreadcrumbSchema([
      { name: 'Главная', url: 'https://www.learnenglisheasy.ru/' },
      { name: 'Статьи', url: 'https://www.learnenglisheasy.ru/article' },
      { name: article.value.title, url: window.location.href }
    ]);
  }
}


</script>

<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages :title="article?.title" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <div class="body-container" v-html="article?.body"></div>
      <AppFooter/>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.body-container {
  max-width: 1440px;
  margin: auto;
}
</style>
