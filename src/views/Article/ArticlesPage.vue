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
          <ion-title size="large">Блог</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="articles-container glass-fade-in">
        <!-- Hero Section -->
        <div class="articles-hero glass-card glass-card-large">
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
            @click="setArticle(article)"
          />
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped lang="scss">
.articles-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Hero Section */
.articles-hero {
  margin-bottom: 32px;
  padding: 40px 32px;
  background: var(--glass-gradient-accent);
  border: 1px solid var(--glass-border);
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
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
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
    padding: 16px;
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

