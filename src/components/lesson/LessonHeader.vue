<script setup lang="ts">
import ProgressBar from '@/components/ui/ProgressBar.vue';
import GameIcon from '@/components/ui/GameIcon.vue';

defineProps<{
  ratio: number;
  hearts: number | null;
  combo: number;
  showCombo: boolean;
}>();

defineEmits<{ close: [] }>();
</script>

<template>
  <header class="lh">
    <button type="button" class="lh__close" aria-label="Выйти из урока" @click="$emit('close')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
    </button>
    <div class="lh__bar">
      <ProgressBar :value="ratio" :height="18" label="Прогресс урока" />
      <Transition name="combo">
        <span v-if="showCombo" :key="combo" class="lh__combo">
          <GameIcon name="flame" :size="18" /> {{ combo }} подряд
        </span>
      </Transition>
    </div>
    <div v-if="hearts !== null" class="lh__hearts" :aria-label="`Жизни: ${hearts}`">
      <GameIcon name="heart" :size="28" :muted="hearts === 0" />
      <span class="nums">{{ hearts }}</span>
    </div>
  </header>
</template>

<style scoped>
.lh {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: var(--page-max);
  margin: 0 auto;
  padding: calc(14px + env(safe-area-inset-top)) 16px 8px;
}

.lh__close {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--text-subtle);
  cursor: pointer;
}

.lh__close svg { width: 24px; height: 24px; }
.lh__close:hover { background: var(--surface-2); }

.lh__bar {
  position: relative;
  flex: 1;
}

.lh__combo {
  position: absolute;
  top: -22px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--orange);
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
  transform: translateX(-50%);
}

.lh__hearts {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--red);
  font-size: 1.1rem;
  font-weight: 900;
}

.combo-enter-active { animation: pop 380ms var(--spring) both; }
.combo-leave-active { transition: opacity 150ms ease; }
.combo-leave-to { opacity: 0; }
</style>
