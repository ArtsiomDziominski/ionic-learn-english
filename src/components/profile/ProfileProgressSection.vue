<template>
  <div class="progress-section glass-card">
    <h3 class="section-title">Прогресс обучения</h3>
    
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Сегодня изучено</span>
        <span class="progress-status" :class="{ 'completed': hasStudiedToday }">
          {{ hasStudiedToday ? '✓ Завершено' : 'Не изучено' }}
        </span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: hasStudiedToday ? '100%' : '0%' }"></div>
      </div>
    </div>

    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Лучшая серия</span>
        <span class="progress-value">{{ bestStreak }} дней</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: bestStreakPercentage + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasStudiedToday: boolean;
  bestStreak: number;
  bestStreakPercentage: number;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.progress-section {
  margin-bottom: 24px;
  padding: 24px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin: 0;
}

.progress-item {
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 500;
  color: white;
}

.progress-status {
  font-size: 0.9rem;
  font-weight: 500;
  
  &.completed {
    color: var(--ion-color-success);
  }
}

.progress-value {
  font-weight: 600;
  color: var(--ion-color-primary);
}

.progress-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--glass-gradient-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
