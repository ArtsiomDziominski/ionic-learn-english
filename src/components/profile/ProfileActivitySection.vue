<template>
  <div v-if="recentStudyDays.length" class="activity-section app-card">
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
  padding: var(--app-sp-5);
}

/* Заголовки секций нейтральные: акцентный цвет закреплён за
   действиями и прогрессом, иначе он перестаёт что-либо значить */
.section-title {
  font-size: var(--app-fs-h2);
  font-weight: 700;
  color: var(--app-text);
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
  background: var(--app-surface-2);
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &.completed {
    background: var(--app-tint-success);
  }
}

.activity-date {
  font-weight: 500;
  color: var(--app-text);
}

.activity-status {
  ion-icon {
    font-size: 20px;
  }
}
</style>
