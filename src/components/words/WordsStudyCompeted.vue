<script setup lang="ts">
import {checkmarkCircleOutline, flameOutline, starOutline} from "ionicons/icons";
import {IonButton, IonIcon, useIonRouter} from '@ionic/vue';
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
const {totalPoints} = storeToRefs(storePoints);

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

/* Индекс считался как random() * (length + 0.5) и иногда выходил
   за границы массива — похвала оказывалась пустой. */
const randomTitle = computed(() => praiseArray[Math.floor(Math.random() * praiseArray.length)]);

const calculatePointsReward = (): number => {
  const today = new Date().toISOString().split('T')[0];
  const todayRepeat = storePoints.dailyRepeats.find(repeat => repeat.date === today);
  const currentRepeatCount = todayRepeat ? todayRepeat.repeatCount : 0;
  return (currentRepeatCount + 1) * 5;
};

const animatePoints = (targetPoints: number): void => {
  const startPoints = animatedPoints.value;
  const targetTotal = startPoints + targetPoints;
  pointsEarned.value = targetPoints;

  const duration = 1400;
  const startTime = Date.now();

  const animate = (): void => {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    animatedPoints.value = Math.floor(startPoints + targetPoints * easeOut);

    if (progress < 1) requestAnimationFrame(animate);
    else animatedPoints.value = targetTotal;
  };

  animate();
};

const addPointsWithAnimation = (): void => {
  if (pointsAlreadyAdded.value) return;

  const pointsToAdd = calculatePointsReward();
  showAnimation.value = true;
  pointsAlreadyAdded.value = true;

  storePoints.addPointsForStudyCompletion();
  animatePoints(pointsToAdd);
};

/* Баллы уже начислены при открытии экрана, поэтому переходим
   сразу. Раньше здесь стоял setTimeout на 3 секунды: нажатие
   не давало никакой реакции и читалось как зависание. */
const finish = (goToNextFlow: boolean): void => {
  storeStatistics.addStudyDay();
  storeWords.resetFlow();

  if (goToNextFlow) {
    storeWords.initializeWordsList(currentFlow.value);
    ionRouter.push('/words/progress');
  } else {
    ionRouter.push('/words');
  }
};

onMounted(() => {
  storePoints.loadPoints();
  storeStatistics.loadStatistics();
  animatedPoints.value = totalPoints.value;

  setTimeout(() => {
    addPointsWithAnimation();
    setTimeout(() => (showAnimation.value = false), 2000);
  }, 250);
});

watch(totalPoints, (newValue) => {
  if (!showAnimation.value) animatedPoints.value = newValue;
});
</script>

<template>
  <div class="done">
    <AppConfetti/>

    <div class="done__body">
      <div class="done__badge">
        <ion-icon :icon="checkmarkCircleOutline" />
      </div>

      <h1 class="done__title">{{ randomTitle }}</h1>
      <p class="done__subtitle">Слова изучены. Продолжайте в том же духе</p>

      <div class="done__points" :class="{ 'done__points--pulse': showAnimation }">
        <ion-icon :icon="starOutline" />
        <span class="done__points-value app-nums">{{ animatedPoints }}</span>
        <span v-if="pointsEarned" class="done__points-gain app-nums">+{{ pointsEarned }}</span>
      </div>

      <div class="done__stats">
        <div class="done__stat">
          <span class="done__stat-value app-nums">{{ totalStudyDays }}</span>
          <span class="done__stat-label">дней изучено</span>
        </div>
        <div class="done__stat">
          <span class="done__stat-value app-nums">
            <ion-icon :icon="flameOutline" class="done__stat-icon" />{{ currentStreak }}
          </span>
          <span class="done__stat-label">серия дней</span>
        </div>
      </div>
    </div>

    <div class="done__actions">
      <ion-button expand="block" class="app-btn-primary" @click="finish(true)">
        Продолжить
      </ion-button>
      <ion-button expand="block" fill="clear" class="done__exit" @click="finish(false)">
        Выйти
      </ion-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.done {
  position: relative;
  min-height: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: var(--app-sp-6) var(--app-sp-4) var(--app-sp-5);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--app-sp-6);

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--app-sp-3);
    text-align: center;
  }

  &__badge {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: var(--app-r-pill);
    background: var(--app-tint-success);
    color: var(--ion-color-success);
    font-size: 40px;
  }

  &__title {
    font-size: var(--app-fs-display);
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  &__subtitle {
    font-size: var(--app-fs-body);
    color: var(--app-text-muted);
    margin: 0;
  }

  /* Награда — главный акцент экрана */
  &__points {
    display: inline-flex;
    align-items: center;
    gap: var(--app-sp-2);
    margin-top: var(--app-sp-2);
    padding: var(--app-sp-3) var(--app-sp-5);
    border-radius: var(--app-r-pill);
    background: var(--app-tint-warning);
    color: var(--app-warning-ink);
    font-size: 22px;
    transition: transform var(--app-dur-slow) var(--app-ease-spring);

    &--pulse {
      transform: scale(1.06);
    }

    &-value {
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    &-gain {
      font-size: var(--app-fs-sm);
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--app-r-pill);
      background: var(--ion-color-warning);
      color: var(--ion-color-warning-contrast);
    }
  }

  &__stats {
    display: flex;
    gap: var(--app-sp-3);
    margin-top: var(--app-sp-3);
  }

  &__stat {
    min-width: 108px;
    padding: var(--app-sp-3);
    border-radius: var(--app-r-md);
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    display: flex;
    flex-direction: column;
    gap: 2px;

    &-value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-size: var(--app-fs-h1);
      font-weight: 700;
      color: var(--app-text);
    }

    &-icon {
      font-size: 17px;
      color: var(--app-warning-ink);
    }

    &-label {
      font-size: var(--app-fs-caption);
      color: var(--app-text-subtle);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: var(--app-sp-1);
  }

  &__exit {
    --color: var(--app-text-muted);
  }
}
</style>
