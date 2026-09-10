<template>
  <div class="stats-grid">
    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="calendarOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalStudyDays }}</div>
        <div class="stat-label">Дней изучения</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="flameOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ currentStreak }}</div>
        <div class="stat-label">Серия дней</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="bookOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ studiedWordsCount }}</div>
        <div class="stat-label">Изученных слов</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="starOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ favoritesCount }}</div>
        <div class="stat-label">Избранных слов</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="calendarOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ getStudyDaysThisWeek }}</div>
        <div class="stat-label">На этой неделе</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="trendingUpOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ getAverageStudyDaysPerWeek }}</div>
        <div class="stat-label">Среднее в неделю</div>
      </div>
    </div>

    <div class="stat-card app-card points-card">
      <div class="stat-icon points-icon">
        <ion-icon :icon="starOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalPoints }}</div>
        <div class="stat-label">Баллов заработано</div>
      </div>
    </div>

    <div class="stat-card app-card">
      <div class="stat-icon">
        <ion-icon :icon="flameOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ todayRepeatCount }}</div>
        <div class="stat-label">Повторений сегодня</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  calendarOutline, 
  flameOutline, 
  bookOutline, 
  starOutline,
  trendingUpOutline
} from 'ionicons/icons';

interface Props {
  totalStudyDays: number;
  currentStreak: number;
  studiedWordsCount: number;
  favoritesCount: number;
  getStudyDaysThisWeek: number;
  getAverageStudyDaysPerWeek: number;
  totalPoints: number;
  todayRepeatCount: number;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
/* Плитки статистики: нейтральная поверхность, цвет несёт только
   иконка. Раньше карточки заливались насыщенным градиентом, и
   цифра теряла контраст на собственном фоне. */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--app-sp-3);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--app-sp-3);
  padding: var(--app-sp-4);
}

.stat-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: var(--app-r-md);
  background: var(--app-tint-primary);
  color: var(--app-accent-ink);
  font-size: 20px;
}

.stat-content {
  min-width: 0;
}

.stat-number {
  font-size: var(--app-fs-h1);
  font-weight: 700;
  line-height: 1.1;
  color: var(--app-text);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: var(--app-fs-sm);
  color: var(--app-text-muted);
  line-height: 1.3;
  margin-top: 2px;
}

/* Баллы — единственная выделенная плитка: это валюта прогресса */
.points-card .stat-icon {
  background: var(--app-tint-warning);
  color: var(--app-warning-ink);
}
</style>
