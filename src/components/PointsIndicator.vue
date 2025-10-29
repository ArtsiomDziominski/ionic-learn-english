<template>
  <div class="points-indicator" @click="toProfile">
    <ion-icon :icon="starOutline" color="warning" />
    <span class="points-text">{{ totalPoints }}</span>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { starOutline } from 'ionicons/icons';
import { computed, onMounted } from 'vue';
import { pointsStore } from '@/store/points';
import { storeToRefs } from 'pinia';
import router from '@/router';

const storePoints = pointsStore();
const { totalPoints } = storeToRefs(storePoints);

onMounted(() => {
  storePoints.loadPoints();
});

const toProfile = () => {
  router.push('/profile');
}
</script>

<style scoped lang="scss">
.points-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  backdrop-filter: blur(10px);
}

.points-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-color-warning);
}
</style>
