<template>
  <div class="points-section glass-card">
    <h3 class="section-title">Система баллов</h3>
    
    <div class="points-info">
      <div class="points-summary">
        <div class="points-item">
          <ion-icon :icon="starOutline" color="warning" />
          <div class="points-content">
            <div class="points-value">{{ totalPoints }}</div>
            <div class="points-desc">Всего баллов</div>
          </div>
        </div>
        
        <div class="points-item">
          <ion-icon :icon="calendarOutline" color="primary" />
          <div class="points-content">
            <div class="points-value">{{ getPointsThisWeek }}</div>
            <div class="points-desc">На этой неделе</div>
          </div>
        </div>
        
        <div class="points-item">
          <ion-icon :icon="trendingUpOutline" color="success" />
          <div class="points-content">
            <div class="points-value">{{ getPointsThisMonth }}</div>
            <div class="points-desc">В этом месяце</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { 
  starOutline,
  calendarOutline,
  trendingUpOutline
} from 'ionicons/icons';

interface Props {
  totalPoints: number;
  getPointsThisWeek: number;
  getPointsThisMonth: number;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.points-section {
  margin-bottom: 24px;
  padding: 24px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--ion-color-primary);
  margin: 0;
}

.points-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.points-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.points-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.points-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.points-content {
  flex: 1;
}

.points-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.points-desc {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}
</style>
