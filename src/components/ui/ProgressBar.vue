<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  /** 0–1 */
  value: number;
  color?: string;
  track?: string;
  height?: number;
  shine?: boolean;
  label?: string;
}>(), {
  color: 'var(--green)',
  track: 'var(--surface-3)',
  height: 16,
  shine: true,
  label: undefined,
});

const pct = computed(() => Math.round(Math.min(1, Math.max(0, props.value)) * 1000) / 10);
</script>

<template>
  <div
    class="pbar"
    role="progressbar"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(pct)"
    :style="{ height: `${height}px`, background: track }"
  >
    <div
      class="pbar__fill"
      :class="{ 'pbar__fill--empty': pct === 0 }"
      :style="{ width: `${pct}%`, background: color, minWidth: pct > 0 ? `${height}px` : '0' }"
    >
      <span v-if="shine && pct > 0" class="pbar__shine" />
    </div>
  </div>
</template>

<style scoped>
.pbar {
  position: relative;
  width: 100%;
  border-radius: var(--r-pill);
  overflow: hidden;
}

.pbar__fill {
  position: relative;
  height: 100%;
  border-radius: inherit;
  transition: width 600ms var(--spring);
}

.pbar__fill--empty {
  transition: none;
}

/* Блик сверху — полоска читается «объёмной», как в Duolingo */
.pbar__shine {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 22%;
  height: 26%;
  min-height: 2px;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.35);
}
</style>
