<script setup lang="ts">
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import {useRoute} from "vue-router";
import {IonContent, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/vue";
import HeaderToolbarPages from "@/components/header/HeaderToolbarPages.vue";
import {useHead} from "@vueuse/head";

const route = useRoute();

const article: Ref<UnwrapRef<ARTICLE.Article | null>> = ref(null);

onMounted(async () => {
  const id = route.params.id;
  const response = await fetch(`/articles/${id}.json`);
  article.value = await response.json();
  setMeta();
})

const setMeta = () => {
  useHead({
    title: article.value?.title || '',
    meta: [
      {
        name: 'description',
        content: article.value?.description || ''
      },
      {
        property: 'og:title',
        content: article.value?.title || ''
      },
      {
        property: 'og:description',
        content: article.value?.description || ''
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
        content: article.value?.img || ''
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: article.value?.title || ''
      },
      {
        name: 'twitter:description',
        content: article.value?.description || ''
      },
      {
        name: 'twitter:image',
        content: article.value?.img || ''
      }
    ]
  })
}


</script>

<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarPages :title="article?.title" />
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="body-container" v-html="article?.body"></div>

    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.body-container {
  max-width: 1440px;
  margin: auto;
}
</style>