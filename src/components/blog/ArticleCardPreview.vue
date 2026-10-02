<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  article: {
    type: Object as PropType<ARTICLE.Article>,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});
</script>

<template>
  <router-link
    class="article card--press enter"
    :style="{ animationDelay: `${Math.min(index, 8) * 60}ms` }"
    :to="`/article/${article.id}`"
  >
    <img :src="article.img" class="article__img" :alt="article.title" loading="lazy" />
    <div class="article__body">
      <h2 class="article__title">{{ article.title }}</h2>
      <p class="article__text">{{ article.description || 'Полезная статья для изучения английского языка' }}</p>
      <span class="article__more">
        Читать
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m0 0l-6-6m6 6l-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
    </div>
  </router-link>
</template>

<style scoped>
.article {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--line);
  border-radius: var(--r-xl);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
}

.article__img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  background: var(--surface-2);
}

.article__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 16px;
}

.article__title {
  font-size: 1.08rem;
  font-weight: 900;
}

.article__text {
  flex: 1;
  color: var(--text-muted);
  font-size: 0.92rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article__more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--violet-ink);
  font-weight: 900;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.article__more svg {
  width: 18px;
  height: 18px;
}
</style>
