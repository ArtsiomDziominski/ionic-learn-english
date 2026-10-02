<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
}>(), {
  size: 72,
  stroke: 8,
  color: 'var(--orange)',
  track: 'var(--surface-3)',
});

const r = computed(() => (props.size - props.stroke) / 2);
const c = computed(() => 2 * Math.PI * r.value);
const offset = computed(() => c.value * (1 - Math.min(1, Math.max(0, props.value))));
</script>

<template>
  <div class="ring" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size" aria-hidden="true">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="track" :stroke-width="stroke" />
      <circle
        class="ring__value"
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        :stroke="color"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="c"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring__center"><slot /></div>
  </div>
</template>

<style scoped>
.ring {
  position: relative;
  flex-shrink: 0;
}

.ring svg {
  display: block;
}

.ring__value {
  transition: stroke-dashoffset 700ms var(--ease);
}

.ring__center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
