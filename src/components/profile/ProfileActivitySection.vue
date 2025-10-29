<template>
  <div v-if="recentStudyDays.length" class="activity-section glass-card">
    <h3 class="section-title">Последние дни обучения</h3>
    <div class="activity-list">
      <div 
        v-for="day in recentStudyDays" 
        :key="day.date"
        class="activity-item"
        :class="{ 'completed': day.completed }"
      >
        <div class="activity-date">
          {{ formatDate(day.date) }}
        </div>
        <div class="activity-status">
          <ion-icon 
            :icon="day.completed ? checkmarkCircleOutline : closeCircleOutline" 
            :color="day.completed ? 'success' : 'medium'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';

interface StudyDay {
  date: string;
  completed: boolean;
}

interface Props {
  recentStudyDays: StudyDay[];
}

defineProps<Props>();

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
};
</script>

<style scoped lang="scss">
.activity-section {
  margin-bottom: 24px;
  padding: 24px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &.completed {
    background: rgba(76, 175, 80, 0.1);
  }
}

.activity-date {
  font-weight: 500;
  color: var(--ion-color-light);
}

.activity-status {
  ion-icon {
    font-size: 20px;
  }
}
</style>
