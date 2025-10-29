<script setup lang="ts">
import {checkmarkCircleOutline, starOutline} from "ionicons/icons";
import {IonIcon, useIonRouter} from '@ionic/vue';
import AppConfetti from "@/components/AppConfetti.vue";
import {computed, onMounted, ref, watch} from "vue";
import {wordsStore} from "@/store/words";
import {statisticsStore} from "@/store/statistics";
import {pointsStore} from "@/store/points";
import {storeToRefs} from "pinia";

const ionRouter = useIonRouter();
const storeWords = wordsStore();
const storeStatistics = statisticsStore();
const storePoints = pointsStore();
const {currentFlow} = storeToRefs(storeWords);
const {totalStudyDays, currentStreak} = storeToRefs(storeStatistics);
const {totalPoints, todayRepeatCount} = storeToRefs(storePoints);

// Реактивные переменные для анимации
const animatedPoints = ref(0);
const pointsEarned = ref(0);
const showAnimation = ref(false);
const pointsAlreadyAdded = ref(false);

const praiseArray = [
  "Отлично!",
  "Вау!",
  "Хорошая работа!",
  "Здорово!",
  "Класс!",
  "Молодец!",
  "Прекрасно!",
  "Супер!",
  "Впечатляюще!",
  "Отличная работа!",
  "Потрясающе!",
  "Замечательно!",
  "Великолепно!"
];

const randomTitle = computed(() => praiseArray[Math.floor(Math.random() * (praiseArray.length + 0.5))])

// Рассчитываем награду, которую получит пользователь
const calculatePointsReward = (): number => {
  const today = new Date().toISOString().split('T')[0];
  const dailyRepeats = storePoints.dailyRepeats;
  const todayRepeat = dailyRepeats.find(repeat => repeat.date === today);
  const currentRepeatCount = todayRepeat ? todayRepeat.repeatCount : 0;
  return (currentRepeatCount + 1) * 5; // 5, 10, 15, 20...
};

const addPointsWithAnimation = (): void => {
  if (pointsAlreadyAdded.value) return;
  
  // Рассчитываем баллы ДО добавления
  const pointsToAdd = calculatePointsReward();
  
  // Показываем анимацию
  showAnimation.value = true;
  pointsAlreadyAdded.value = true;
  
  // Начисляем баллы
  storePoints.addPointsForStudyCompletion();
  
  // Запускаем анимацию подсчета
  animatePoints(pointsToAdd);
};

const animatePoints = (targetPoints: number): void => {
  const startPoints = animatedPoints.value;
  const targetTotal = startPoints + targetPoints;
  pointsEarned.value = targetPoints;
  
  const duration = 2500; // 2.5 секунды
  const startTime = Date.now();
  
  const animate = (): void => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Используем функцию easeOut для плавной анимации
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };
    
    animatedPoints.value = Math.floor(startPoints + targetPoints * easeOut(progress));
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      animatedPoints.value = targetTotal;
    }
  };
  
  animate();
};

const toSetFlow = (): void => {
  // Начисляем баллы и обновляем статистику
  if (!pointsAlreadyAdded.value) {
    addPointsWithAnimation();
  }
  
  // Добавляем день изучения в статистику
  storeStatistics.addStudyDay();
  
  // Ждем завершения анимации перед переходом
  setTimeout(() => {
    storeWords.resetFlow();
    storeWords.initializeWordsList(currentFlow.value);
    ionRouter.push('/words/progress');
  }, 3000);
}

const toHome = (): void => {
  // Начисляем баллы и обновляем статистику
  if (!pointsAlreadyAdded.value) {
    addPointsWithAnimation();
  }
  
  // Добавляем день изучения в статистику
  storeStatistics.addStudyDay();
  
  // Ждем завершения анимации перед переходом
  setTimeout(() => {
    storeWords.resetFlow();
    ionRouter.push('/words');
  }, 3000);
}

onMounted(() => {
  storePoints.loadPoints();
  storeStatistics.loadStatistics();
  animatedPoints.value = totalPoints.value;
  
  // Небольшая задержка перед началом анимации для плавности
  setTimeout(() => {
    addPointsWithAnimation();
    
    // Сбрасываем анимацию через 3 секунды после начала
    setTimeout(() => {
      showAnimation.value = false;
    }, 3000);
  }, 300);
});

// Синхронизируем анимированные баллы с реальными
watch(totalPoints, (newValue) => {
  if (!showAnimation.value) {
    animatedPoints.value = newValue;
  }
});

</script>

<template>
  <div class="words-study">
    <ion-icon :icon="checkmarkCircleOutline" size="large" color="medium"/>
    <ion-text class="title">
      {{ randomTitle }}
    </ion-text>
    <ion-text class="description">
      Вы успешно изучили слова! Продолжайте в том же духе
    </ion-text>
    
    <!-- Статистика -->
    <div class="stats-section">
      <div class="stats-item">
        <span class="stats-number">{{ totalStudyDays }}</span>
        <span class="stats-label">дней изучено</span>
      </div>
      <div class="stats-item">
        <span class="stats-number">{{ currentStreak }}</span>
        <span class="stats-label">серия дней</span>
      </div>
    </div>
    
    <!-- Баллы -->
    <div class="points-section">
      <div class="points-earned animating">
        <ion-icon :icon="starOutline" color="warning" />
        <span class="points-text">+{{ pointsEarned }} баллов!</span>
      </div>
      <div class="points-total">
        <span class="points-number" :class="{ incrementing: showAnimation }">{{ animatedPoints }}</span>
      </div>
      <!-- <div v-if="todayRepeatCount > 0" class="repeat-info">
        <span class="repeat-text">Повторение #{{ todayRepeatCount + 1 }} сегодня</span>
      </div> -->
    </div>
    
    <div class="buttons">
      <ion-button shape="round" @click="toSetFlow">Продолжить</ion-button>
      <ion-button shape="round" fill="outline" @click="toHome">Выйти</ion-button>
    </div>
    <AppConfetti/>
  </div>
</template>

<style scoped lang="scss">
.words-study {
  height: 100%;
  display: grid;
  grid-template-rows: repeat(5, min-content) 1fr;
  justify-items: center;
  padding: 30px 10px;

  .title {
    font-size: 36px;
  }

  .description {
    font-size: 16px;
  }

  .stats-section {
    display: flex;
    gap: 20px;
    margin: 20px 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stats-number {
    font-size: 24px;
    font-weight: 700;
    color: var(--ion-color-primary);
    margin-bottom: 4px;
  }

  .stats-label {
    font-size: 12px;
    color: var(--ion-color-light);
    font-weight: 500;
  }

  .points-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
    padding: 20px;
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 152, 0, 0.2) 100%);
    border-radius: 16px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 193, 7, 0.3);
  }

  .points-earned {
    display: flex;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--ion-color-warning);
    
    &.animating {
      animation: earnedBounce 2.5s ease-out, earnedGlow 2.5s ease-in-out;
    }
  }

  @keyframes earnedBounce {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes earnedGlow {
    0%, 100% {
      text-shadow: none;
    }
    50% {
      text-shadow: 0 0 20px rgba(255, 193, 7, 0.8);
    }
  }

  .points-text {
    color: var(--ion-color-warning);
  }

  .points-total {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .points-label {
    font-size: 14px;
    color: var(--ion-color-medium);
  }

  .points-number {
    font-size: 20px;
    font-weight: 700;
    color: var(--ion-color-primary);
    transition: transform 0.2s ease-out;
    
    &.incrementing {
      animation: numberPulse 2.5s ease-in-out;
    }
  }

  @keyframes numberPulse {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.15);
      color: var(--ion-color-warning);
    }
    50% {
      transform: scale(1.1);
      color: var(--ion-color-warning);
    }
    75% {
      transform: scale(1.15);
      color: var(--ion-color-warning);
    }
  }

  .repeat-info {
    font-size: 12px;
    color: var(--ion-color-success);
    font-weight: 500;
  }

  .repeat-text {
    background: rgba(76, 175, 80, 0.2);
    padding: 4px 8px;
    border-radius: 8px;
  }

  .buttons {
    grid-area: 6/1/7/2;
    display: flex;
    flex-direction: column;
    align-self: flex-end;
  }

  ion-text {
    margin: 20px 0;
    text-align: center;
  }
  ion-button {
    margin: 10px 0;
  }
}
</style>