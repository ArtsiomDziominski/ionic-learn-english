<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Статьи" back />
    </ion-header>
    <ion-content>
      <div class="page stack">
        <section class="hero">
          <LexiMascot mood="read" :size="120" />
          <div>
            <h1 class="hero__title">Блог для изучения английского</h1>
            <p class="muted">Полезные статьи, советы и ресурсы для эффективного изучения языка</p>
          </div>
        </section>

        <div class="grid">
          <ArticleCardPreview
            v-for="(article, index) in articles"
            :key="article.id"
            :article="article"
            :index="index"
          />
        </div>

        <AppFooter />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import ArticleCardPreview from '@/components/blog/ArticleCardPreview.vue';
import AppFooter from '@/components/AppFooter.vue';
import PageTopBar from '@/components/PageTopBar.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import { useSEO } from '@/composables/useSEO';

const articles = ref<ARTICLE.Article[]>([]);

onMounted(async () => {
  useSEO({
    title: 'Статьи для изучения английского языка | Слова.Day',
    description: 'Узнайте лучшие статьи и ресурсы для изучения английского языка. Полезные советы, методы и рекомендации для всех уровней. Эффективные способы запоминания слов, грамматика и практические упражнения.',
    keywords: 'английский язык, изучение английского, статьи, ресурсы, советы по изучению английского, методы изучения, как учить английский',
    url: 'https://www.learnenglisheasy.ru/article',
  });

  try {
    const list: string[] = await (await fetch('/articles/list.json')).json();
    // Параллельно, а не по одной: список открывается сразу целиком
    const loaded = await Promise.all(list.map(async (slug) => {
      const data = await (await fetch(`/articles/${slug}.json`)).json();
      return { ...data, id: data.id ?? slug } as ARTICLE.Article;
    }));
    articles.value = loaded;
  } catch {
    articles.value = [];
  }
});
</script>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.hero {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero__title {
  font-size: 1.4rem;
  font-weight: 900;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 560px) {
  .grid { grid-template-columns: 1fr 1fr; }
}
</style>
