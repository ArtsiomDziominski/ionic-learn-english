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
  <div class="vocabulary-container glass-fade-in">
    <!-- Header Section -->
    <div class="vocabulary-header glass-card glass-card-large">
      <div class="header-content">
        <h1 class="header-title">Мой словарь</h1>
        <p class="header-subtitle">Управляйте своими изученными словами и избранным</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions glass-card glass-card-large">
      <h2 class="actions-title">Быстрые действия</h2>
      <div class="actions-grid">
        <button
          class="action-btn glass-button"
          v-for="content in contents"
          :key="`action-${content.title}`"
          @click="setVocabularyView(content.view)"
          :class="`action-${content.title}`"
        >
          <ion-icon :icon="content.icon" class="btn-icon"></ion-icon>
          <span class="btn-text">{{ titles[content.title] }}</span>
          <div class="stat-count">{{ content.count }}</div>
          <div class="btn-glow"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vocabulary-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Section */
.vocabulary-header {
  margin-bottom: 32px;
  padding: 40px 32px;
  background: var(--glass-gradient-secondary);
  position: relative;
  overflow: hidden;
}

.vocabulary-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.header-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.6;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  position: relative;
  padding: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--glass-shadow-hover);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Stat-specific styling */
.stat-allWords {
  background: var(--glass-gradient-primary);
}

.stat-studiedWords {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
}

.stat-favoritesWords {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--glass-border-radius-small);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.stat-icon ion-icon {
  font-size: 28px;
  color: #ffffff;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.stat-count {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.stat-action {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.stat-card:hover .stat-action {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
}

.stat-action .action-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-action .action-icon {
  color: #ffffff;
  transform: translateX(2px);
}

/* Quick Actions */
.quick-actions {
  padding: 32px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius);
  position: relative;
  overflow: hidden;
}

.quick-actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.actions-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
  text-align: center;
  position: relative;
  z-index: 1;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  position: relative;
  z-index: 1;
}

.action-btn {
  position: relative;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-radius: var(--glass-border-radius-small);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 120px;
  overflow: hidden;
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--glass-shadow-hover);
  border-color: rgba(255, 255, 255, 0.3);
}

.action-btn:active {
  transform: translateY(-2px) scale(1.01);
}

/* Action-specific styling */
.action-allWords {
  background: var(--glass-gradient-primary);
}

.action-studiedWords {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%);
}

.action-favoritesWords {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
}

.btn-icon {
  font-size: 32px;
  color: #ffffff;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.action-btn:hover .btn-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.btn-text {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.btn-glow {
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

.action-btn:hover .btn-glow {
  opacity: 1;
}

/* Animation delays for staggered effect */
.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

.action-btn:nth-child(1) { animation-delay: 0.1s; }
.action-btn:nth-child(2) { animation-delay: 0.2s; }
.action-btn:nth-child(3) { animation-delay: 0.3s; }

/* Responsive Design */
@media (max-width: 768px) {
  .vocabulary-container {
    padding: 16px;
  }

  .vocabulary-header {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .header-title {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    padding: 20px;
  }

  .quick-actions {
    padding: 24px 20px;
  }

  .actions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .action-btn {
    padding: 16px;
    min-height: 100px;
  }

  .btn-icon {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.8rem;
  }

  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
  }

  .stat-icon ion-icon {
    font-size: 24px;
  }

  .stat-count {
    font-size: 1.5rem;
  }

  .action-btn {
    padding: 14px;
    min-height: 90px;
  }

  .btn-icon {
    font-size: 24px;
  }

  .btn-text {
    font-size: 0.9rem;
  }
}
</style>
