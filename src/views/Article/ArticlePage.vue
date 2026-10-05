<script setup lang="ts">
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import {useRoute} from "vue-router";
import {IonContent, IonHeader, IonPage} from "@ionic/vue";
import PageTopBar from "@/components/PageTopBar.vue";
import AppFooter from "@/components/AppFooter.vue";
import {useArticleSEO} from "@/composables/useSEO";
import {useArticleSchema, useBreadcrumbSchema} from "@/composables/useStructuredData";
import {trackEvent} from "@/utils/analytics";

const route = useRoute();

const article: Ref<UnwrapRef<ARTICLE.Article | null>> = ref(null);

onMounted(async () => {
  const id = route.params.id;
  const response = await fetch(`/articles/${id}.json`);
  article.value = await response.json();
  setMeta();
  trackEvent('article_view', {article_id: String(id), article_title: article.value?.title ?? ''});
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
    <ion-header class="header">
      <PageTopBar :title="article?.title ?? 'Статья'" back />
    </ion-header>
    <ion-content>
      <!-- Тексты статей — наш собственный контент из public/articles -->
      <div class="body-container" v-html="article?.body"></div>
      <div class="page"><AppFooter /></div>
    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.body-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  font-size: 1.02rem;
  line-height: 1.7;
}
</style>
