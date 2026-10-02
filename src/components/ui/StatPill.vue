<script setup lang="ts">
import GameIcon from './GameIcon.vue';
import type { GameIconName } from '@/art/icons';

withDefaults(defineProps<{
  icon: GameIconName;
  value: string | number;
  color?: string;
  muted?: boolean;
  label: string;
}>(), {
  color: 'var(--text)',
  muted: false,
});

defineEmits<{ click: [] }>();
</script>

<template>
  <button type="button" class="pill" :aria-label="label" @click="$emit('click')">
    <GameIcon :name="icon" :size="26" :muted="muted" />
    <span class="pill__value nums" :style="{ color: muted ? 'var(--text-subtle)' : color }">{{ value }}</span>
  </button>
</template>

<style scoped>
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: var(--tap);
  padding: 4px 8px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.pill:hover,
.pill:focus-visible {
  background: var(--surface-2);
}

.pill:active .game-icon {
  transform: scale(0.9);
}

.pill__value {
  font-size: 1.05rem;
  font-weight: 900;
}
</style>
