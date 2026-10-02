<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/store/toast';
import GameIcon from './GameIcon.vue';
import type { GameIconName } from '@/art/icons';

const store = useToastStore();
const { toasts } = storeToRefs(store);
</script>

<template>
  <Teleport to="body">
    <div class="toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <button
          v-for="toast in toasts"
          :key="toast.id"
          type="button"
          class="toast"
          :class="`toast--${toast.tone}`"
          @click="store.dismiss(toast.id)"
        >
          <GameIcon v-if="toast.icon" :name="toast.icon as GameIconName" :size="26" />
          <span>{{ toast.message }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top));
  left: 50%;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(440px, calc(100vw - 32px));
  transform: translateX(-50%);
  pointer-events: none;
  font-family: var(--font);
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--elev);
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.toast--success { border-color: var(--green); }
.toast--error { border-color: var(--red); }
.toast--reward { border-color: var(--gold); background: var(--gold-soft); }

.toast-enter-active,
.toast-leave-active {
  transition: opacity 220ms var(--ease), transform 320ms var(--spring);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
</style>
