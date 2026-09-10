<template>
  <button type="button" class="points" :aria-label="`Баллы: ${totalPoints}. Открыть профиль`" @click="toProfile">
    <ion-icon :icon="starOutline" class="points__icon" />
    <span class="points__value app-nums">{{ totalPoints }}</span>
  </button>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { starOutline } from 'ionicons/icons';
import { onMounted } from 'vue';
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
.points {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 var(--app-sp-3);
  border: 0;
  border-radius: var(--app-r-pill);
  background: var(--app-tint-warning);
  color: var(--app-warning-ink);
  font-family: inherit;
  cursor: pointer;
  transition: transform var(--app-dur-fast) var(--app-ease),
              background-color var(--app-dur-fast) var(--app-ease);

  &:active {
    transform: scale(0.95);
  }

  &__icon {
    font-size: 17px;
  }

  &__value {
    font-size: var(--app-fs-body);
    font-weight: 700;
  }
}
</style>
