<template>
  <div class="wrapper-flow glass-fade-in">
    <!-- Hero Section with Glass Effect -->
    <div class="hero-section glass-card glass-card-large">
      <div class="hero-content">
        <h1 class="hero-title">Выберите уровень изучения</h1>
        <p class="hero-subtitle">Начните с любого уровня и совершенствуйте свои знания</p>
        <ion-button
          class="all-words-btn glass-button"
          fill="solid"
          @click="redirectToLearnWords(FlowWords.Random)"
        >
          <ion-icon :icon="caretForwardOutline" slot="start" />
          Все слова
        </ion-button>
      </div>
    </div>

    <!-- Level Cards Grid -->
    <div class="cards-grid">
      <div
        class="glass-card level-card glass-scale-in"
        :class="`level-${index % 6}`"
        v-for="(card, index) in cards"
        :key="card.title"
        @click="redirectToLearnWords(card.title)"
      >
        <div class="card-content">
          <h3 class="level-title">{{ card.description }}</h3>
          <ion-icon :icon="caretForwardOutline" class="arrow-icon" />
          <p class="level-subtitle">{{ getLevelSubtitle(card.title) }}</p>
        </div>
        <div class="card-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {IonIcon, IonButton, useIonRouter} from "@ionic/vue";
import {wordsStore} from "@/store/words";
import {caretForwardOutline} from "ionicons/icons";
import {FlowWords} from "@/const/flow";
import {speak} from "@/utils/util";
import {storeToRefs} from "pinia";
import {settingsStore} from "@/store/settings";

const ionRouter = useIonRouter();
const storeWords = wordsStore();
const { currentWord } = storeToRefs(storeWords);
const storeSettings = settingsStore();
const { voiceSpeech } = storeToRefs(storeSettings);

const getLevelSubtitle = (level: string): string => {
  const subtitles: Record<string, string> = {
    [FlowWords.A1]: 'Основы английского языка',
    [FlowWords.A2]: 'Простые диалоги и фразы',
    [FlowWords.B1]: 'Средний уровень общения',
    [FlowWords.B2]: 'Продвинутое общение',
    [FlowWords.C1]: 'Профессиональный уровень',
    [FlowWords.C2]: 'Носитель языка',
    [FlowWords.Pronoun]: 'Личные, притяжательные и указательные',
    [FlowWords.Number]: 'От 0 до миллиарда',
    [FlowWords.Auto]: 'Дорожное движение и автомобили',
    [FlowWords.Airport]: 'Регистрация, таможня, багаж',
    [FlowWords.Journey]: 'Отели, экскурсии, транспорт',
    [FlowWords.Government]: 'Политика и государство',
    [FlowWords.Health]: 'Симптомы, лечение, врачи',
    [FlowWords.Business]: 'Офис, переговоры, финансы',
    [FlowWords.Science]: 'Технологии и исследования',
    [FlowWords.Food]: 'Рестораны, кулинария, напитки',
    [FlowWords.Culture]: 'Искусство, музыка, театр',
    [FlowWords.Fitness]: 'Спорт, тренировки, здоровье',
    [FlowWords.Fashion]: 'Одежда, стиль, покупки',
    [FlowWords.Ecology]: 'Природа, экология, климат',
    [FlowWords.Socialissues]: 'Общество, права, проблемы',
    [FlowWords.Home]: 'Дом, семья, быт'
  };
  return subtitles[level] || 'Специальная тематика';
};

const cards = [
  {
    title: FlowWords.A1,
    description: 'Beginner A1',
    bg: 'primary'
  },
  {
    title: FlowWords.A2,
    description: 'Elementary A2',
    bg: 'secondary'
  },
  {
    title: FlowWords.B1,
    description: 'Intermediate B1',
    bg: 'tertiary'
  },
  {
    title: FlowWords.B2,
    description: 'Upper Intermediate B2',
    bg: 'warning'
  },
  {
    title: FlowWords.C1,
    description: 'Advanced C1',
    bg: 'medium'
  },
  {
    title: FlowWords.C2,
    description: 'Proficiency C2',
    bg: 'dark'
  },
  {
    title: FlowWords.Pronoun,
    description: 'Местоимения',
    bg: 'secondary'
  },
  {
    title: FlowWords.Number,
    description: 'Числа',
    bg: 'var(--ion-color-tertiary-shade)'
  },
  {
    title: FlowWords.Auto,
    description: 'Автомобильная тематика',
    bg: 'var(--ion-color-danger-shade)'
  },
  {
    title: FlowWords.Airport,
    description: 'Ключевые слова в аэропорту',
    bg: 'var(--ion-color-secondary-tint)'
  },
  {
    title: FlowWords.Journey,
    description: 'Путешествие',
    bg: 'var(--ion-color-warning-shade)'
  },
  {
    title: FlowWords.Government,
    description: 'Государственное управление',
    bg: 'var(--ion-color-success-shade)'
  },
  {
    title: FlowWords.Health,
    description: 'Здоровье и медицина',
    bg: 'var(--ion-color-danger)'
  },
  {
    title: FlowWords.Business,
    description: 'Бизнес и экономика',
    bg: 'primary'
  },
  {
    title: FlowWords.Science,
    description: 'Наука и технологии',
    bg: 'secondary'
  },
  {
    title: FlowWords.Food,
    description: 'Еда и напитки',
    bg: 'tertiary'
  },
  {
    title: FlowWords.Culture,
    description: 'Культура и искусство',
    bg: 'warning'
  },
  {
    title: FlowWords.Fitness,
    description: 'Спорт и фитнес',
    bg: 'medium'
  },
  {
    title: FlowWords.Fashion,
    description: 'Покупки и мода',
    bg: 'dark'
  },
  {
    title: FlowWords.Ecology,
    description: 'Окружающая среда и экология',
    bg: 'secondary'
  },
  {
    title: FlowWords.Socialissues,
    description: 'Социальные вопросы',
    bg: 'var(--ion-color-tertiary-shade)'
  },
  {
    title: FlowWords.Home,
    description: 'Социальные вопросы',
    bg: 'var(--ion-color-danger-shade)'
  }
];

const redirectToLearnWords = (flow: FlowWords): void => {
  storeWords.initializeWordsList(flow);
  ionRouter.push('/words/progress');
  speak(currentWord.value.word, voiceSpeech.value);
}
</script>

<style scoped lang="scss">
.wrapper-flow {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  margin-bottom: 32px;
  padding: 40px 32px;
  background: var(--glass-gradient-primary);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%);
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
  margin-bottom: 32px;
  line-height: 1.6;
}

.all-words-btn {
  --background: var(--glass-bg-secondary);
  --background-hover: var(--glass-bg-tertiary);
  --color: #ffffff;
  border-radius: var(--glass-border-radius-small);
  --padding-start: 24px;
  --padding-end: 24px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  box-shadow: var(--glass-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.all-words-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.level-card {
  position: relative;
  padding: 24px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--glass-border-radius);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 180px;
}

.level-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--glass-shadow-hover);
  border-color: rgba(255, 255, 255, 0.3);
}

.level-card:active {
  transform: translateY(-4px) scale(1.01);
}

/* Level-specific gradients */
.level-0 { background: var(--glass-gradient-primary); }
.level-1 { background: var(--glass-gradient-secondary); }
.level-2 { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%); }
.level-3 { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%); }
.level-4 { background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%); }
.level-5 { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.level-icon {
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
}

.icon-bg {
  width: 40px;
  height: 40px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.arrow-icon {
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}

.level-card:hover .arrow-icon {
  color: #ffffff;
  transform: translateX(4px);
}

.card-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
  align-items: center;
}

.level-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.3;
  margin: 0;
}

.level-subtitle {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
  margin: 0;
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

.level-card:hover .card-glow {
  opacity: 1;
}

/* Animation delays for staggered effect */
.glass-scale-in:nth-child(1) { animation-delay: 0.1s; }
.glass-scale-in:nth-child(2) { animation-delay: 0.2s; }
.glass-scale-in:nth-child(3) { animation-delay: 0.3s; }
.glass-scale-in:nth-child(4) { animation-delay: 0.4s; }
.glass-scale-in:nth-child(5) { animation-delay: 0.5s; }
.glass-scale-in:nth-child(6) { animation-delay: 0.6s; }

/* Responsive Design */
@media (max-width: 768px) {
  .wrapper-flow {
    padding: 16px;
  }

  .hero-section {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .level-card {
    padding: 20px;
    min-height: 160px;
  }

  .level-title {
    font-size: 1.1rem;
  }

  .level-subtitle {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .level-card {
    padding: 16px;
    min-height: min-content;
  }

  .level-icon {
    width: 50px;
    height: 50px;
  }

  .icon-bg {
    width: 30px;
    height: 30px;
  }
}
</style>
