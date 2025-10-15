<script setup lang="ts">
import {PropType} from "vue";

defineProps({
  article: {
    type: Object as PropType<ARTICLE.Article>,
    default: () => {}
  },
  index: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <router-link
    class="article-card glass-card glass-scale-in"
    :style="`animation-delay: ${index * 0.1}s`"
    :to="`/article/${article.id}`"
  >
    <div class="card-image-container">
      <img :src="article.img" class="card-image" :alt="article.title">
      <div class="image-overlay"></div>
    </div>

    <div class="card-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <p class="article-description">{{ article.description || 'Полезная статья для изучения английского языка' }}</p>

      <div class="card-footer">
        <div class="read-more">
          <span class="read-text">Читать статью</span>
          <ion-icon name="arrow-forward" class="arrow-icon"></ion-icon>
        </div>
      </div>
    </div>

    <div class="card-glow"></div>
  </router-link>
</template>

<style scoped lang="scss">
.article-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.article-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--glass-shadow-hover);
  border-color: rgba(255, 255, 255, 0.3);
}

.article-card:active {
  transform: translateY(-4px) scale(1.01);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--glass-border-radius-small) var(--glass-border-radius-small) 0 0;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.article-card:hover .card-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  transition: opacity 0.3s ease;
}

.article-card:hover .image-overlay {
  opacity: 0.8;
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.article-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.article-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0 0 20px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
}

.read-more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius-small);
  transition: all 0.3s ease;
}

.article-card:hover .read-more {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
}

.read-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ffffff;
}

.arrow-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.article-card:hover .arrow-icon {
  color: #ffffff;
  transform: translateX(4px);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.article-card:hover .card-glow {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .card-image-container {
    height: 180px;
  }

  .card-content {
    padding: 20px;
  }

  .article-title {
    font-size: 1.2rem;
  }

  .article-description {
    font-size: 0.9rem;
  }

  .read-more {
    padding: 10px 14px;
  }

  .read-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .article-card {
    min-height: 320px;
  }

  .card-image-container {
    height: 160px;
  }

  .card-content {
    padding: 16px;
  }

  .article-title {
    font-size: 1.1rem;
  }

  .article-description {
    font-size: 0.85rem;
    -webkit-line-clamp: 2;
  }
}
</style>
