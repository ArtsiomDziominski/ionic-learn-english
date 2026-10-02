<script setup lang="ts">
withDefaults(defineProps<{
  /** С какой стороны «хвостик» реплики. */
  tail?: 'left' | 'bottom' | 'none';
}>(), {
  tail: 'left',
});
</script>

<template>
  <div class="bubble" :class="`bubble--${tail}`">
    <slot />
  </div>
</template>

<style scoped>
.bubble {
  position: relative;
  padding: 12px 16px;
  border: 2px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
}

.bubble--left::before,
.bubble--left::after,
.bubble--bottom::before,
.bubble--bottom::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

/* Хвостик из двух треугольников: внешний — цвет рамки, внутренний — фон */
.bubble--left::before {
  left: -14px;
  top: 50%;
  margin-top: -9px;
  border-width: 9px 14px 9px 0;
  border-color: transparent var(--line) transparent transparent;
}

.bubble--left::after {
  left: -10px;
  top: 50%;
  margin-top: -7px;
  border-width: 7px 11px 7px 0;
  border-color: transparent var(--surface) transparent transparent;
}

.bubble--bottom::before {
  bottom: -14px;
  left: 50%;
  margin-left: -9px;
  border-width: 14px 9px 0 9px;
  border-color: var(--line) transparent transparent transparent;
}

.bubble--bottom::after {
  bottom: -10px;
  left: 50%;
  margin-left: -7px;
  border-width: 11px 7px 0 7px;
  border-color: var(--surface) transparent transparent transparent;
}
</style>
