<template>
  <div class="stats-grid">
    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="calendarOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalStudyDays }}</div>
        <div class="stat-label">Дней изучения</div>
      </div>
    </div>

    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="flameOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ currentStreak }}</div>
        <div class="stat-label">Серия дней</div>
      </div>
    </div>

    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="bookOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ studiedWordsCount }}</div>
        <div class="stat-label">Изученных слов</div>
      </div>
    </div>

    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="starOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ favoritesCount }}</div>
        <div class="stat-label">Избранных слов</div>
      </div>
    </div>

    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="calendarOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ getStudyDaysThisWeek }}</div>
        <div class="stat-label">На этой неделе</div>
      </div>
    </div>

    <div class="stat-card glass-card">
      <div class="stat-icon">
        <ion-icon :icon="trendingUpOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ getAverageStudyDaysPerWeek }}</div>
        <div class="stat-label">Среднее в неделю</div>
      </div>
    </div>

    <div class="stat-card glass-card points-card">
      <div class="stat-icon points-icon">
        <ion-icon :icon="starOutline" />
      </div>
      <div class="stat-content">
        <div class="stat-number">{{ totalPoints }}</div>
        <div class="stat-label">Баллов заработано</div>
      </div>
    </div>

    <div class="stat-card glass-card">
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--glass-gradient-secondary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--glass-gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  
  ion-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.points-card {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.points-icon {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
