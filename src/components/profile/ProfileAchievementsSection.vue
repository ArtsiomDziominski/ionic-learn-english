<template>
  <div class="motivation-section app-card">
    <div class="section-header">
      <h3 class="section-title">Достижения</h3>
      <div class="achievements-counter">
        <span class="achievements-unlocked">{{ unlockedAchievementsCount }}</span>
        <span class="achievements-total">/ {{ totalAchievementsCount }}</span>
      </div>
    </div>
    <div class="achievements">
      <div 
        v-for="achievement in achievements" 
        :key="achievement.id"
        class="achievement-item"
        :class="{ 'unlocked': achievement.unlocked }"
      >
        <div class="achievement-icon">
          <ion-icon :icon="achievement.icon" />
        </div>
        <div class="achievement-content">
          <div class="achievement-title">{{ achievement.title }}</div>
          <div class="achievement-description">{{ achievement.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface Props {
  achievements: Achievement[];
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.motivation-section {
  padding: var(--app-sp-5);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Заголовки секций нейтральные: акцентный цвет закреплён за
   действиями и прогрессом, иначе он перестаёт что-либо значить */
.section-title {
  font-size: var(--app-fs-h2);
  font-weight: 700;
  color: var(--app-text);
  margin: 0;
}

.achievements-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--app-surface-2);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.achievements-unlocked {
  color: var(--ion-color-success);
}

.achievements-total {
  color: var(--ion-color-medium);
}

.achievements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  padding-right: 8px;
}

.achievements::-webkit-scrollbar {
  width: 6px;
}

.achievements::-webkit-scrollbar-track {
  background: var(--app-surface-2);
  border-radius: 3px;
}

.achievements::-webkit-scrollbar-thumb {
  background: var(--app-border-strong);
  border-radius: 3px;
}

.achievements::-webkit-scrollbar-thumb:hover {
  background: var(--app-text-subtle);
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--app-surface-2);
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0.5;
  
  &.unlocked {
    opacity: 1;
    background: var(--app-tint-success);
    box-shadow: var(--app-e1);
  }
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--app-tint-primary);
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ion-icon {
    font-size: 24px;
    color: var(--app-accent-ink);
  }
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-weight: 600;
  color: var(--ion-color-light);
  margin-bottom: 4px;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

@media (max-width: 768px) {
  .achievements {
    grid-template-columns: 1fr;
  }
}
</style>
