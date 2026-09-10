<script setup lang="ts">
import HeaderToolbarMainPages from "@/components/header/HeaderToolbarMainPages.vue";
import {IonContent, IonHeader, IonPage} from "@ionic/vue";
import {onMounted, Ref, ref, UnwrapRef} from "vue";
import ArticleCardPreview from "@/components/blog/ArticleCardPreview.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useSEO } from '@/composables/useSEO';

const articles: Ref<UnwrapRef<ARTICLE.Article[]>> = ref([])

onMounted(async () => {
  setMeta();
  const response = await fetch('/articles/list.json');
  const articlesList = await response.json();

  for (const title of articlesList) {
    const response = await fetch(`/articles/${title}.json`);
    const data = await response.json();
    articles.value.push(data);
  }
})

const setMeta = () => {
  useSEO({
    title: 'Статьи для изучения английского языка | Слова.Day',
    description: 'Узнайте лучшие статьи и ресурсы для изучения английского языка. Полезные советы, методы и рекомендации для всех уровней. Эффективные способы запоминания слов, грамматика и практические упражнения.',
    keywords: 'английский язык, изучение английского, статьи, ресурсы, советы по изучению английского, методы изучения, как учить английский',
    url: 'https://www.learnenglisheasy.ru/article'
  });
}
</script>

<template>
  <ion-page>
    <ion-header>
      <HeaderToolbarMainPages title="Полезные статьи для изучения английского языка" />
    </ion-header>
    <ion-content :fullscreen="true">
      <div class="articles-container app-enter">
        <!-- Hero Section -->
        <div class="articles-hero app-card app-card">
          <div class="hero-content">
            <h1 class="hero-title">Блог для изучения английского</h1>
            <p class="hero-subtitle">Полезные статьи, советы и ресурсы для эффективного изучения языка</p>
          </div>
        </div>

        <!-- Articles Grid -->
        <div class="articles-grid">
          <ArticleCardPreview
            v-for="(article, index) in articles"
            :key="article.title"
            :article="article"
            :index="index"
          />
        </div>

        <!-- Footer -->
        <AppFooter/>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.articles-container {
  padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-7);
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.articles-hero {
  margin-bottom: 32px;
  padding: 40px 32px;
  background: linear-gradient(135deg, var(--ion-color-secondary), var(--ion-color-primary));
  position: relative;
  overflow: hidden;
}

.articles-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--app-text);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--app-text);
  margin: 0;
  line-height: 1.6;
}

/* Articles Grid */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .articles-container {
    padding: var(--app-sp-4) var(--app-sp-4) var(--app-sp-6);
  }

  .articles-hero {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
}
</style>

