<script setup lang="ts">
import { useIonRouter } from '@ionic/vue';

withDefaults(defineProps<{
  title: string;
  back?: boolean;
}>(), {
  back: false,
});

const router = useIonRouter();

const goBack = (): void => {
  if (router.canGoBack()) router.back();
  else router.navigate('/', 'back', 'replace');
};
</script>

<template>
  <div class="bar">
    <button v-if="back" type="button" class="bar__back" aria-label="Назад" @click="goBack">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <h1 class="bar__title">{{ title }}</h1>
    <div class="bar__end"><slot /></div>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: var(--page-max);
  min-height: 56px;
  margin: 0 auto;
  padding: 6px 12px;
}

.bar__back {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.bar__back svg { width: 26px; height: 26px; }
.bar__back:hover { background: var(--surface-2); }

.bar__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 1.35rem;
  font-weight: 900;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.bar__end {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
