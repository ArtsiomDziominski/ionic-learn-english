<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  value: number;
  from?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
}>(), {
  from: 0,
  duration: 900,
  delay: 0,
  prefix: '',
  suffix: '',
});

const shown = ref(props.from);
let frame = 0;
let timer = 0;

const reduced = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function run(from: number, to: number): void {
  cancelAnimationFrame(frame);
  window.clearTimeout(timer);
  if (reduced() || props.duration <= 0) {
    shown.value = to;
    return;
  }
  timer = window.setTimeout(() => {
    const start = performance.now();
    const tick = (t: number): void => {
      const k = Math.min(1, (t - start) / props.duration);
      const eased = 1 - Math.pow(1 - k, 3);
      shown.value = Math.round(from + (to - from) * eased);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }, props.delay);
}

onMounted(() => run(props.from, props.value));
watch(() => props.value, (to, prev) => run(prev ?? props.from, to));
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.clearTimeout(timer);
});
</script>

<template>
  <span class="nums">{{ prefix }}{{ shown }}{{ suffix }}</span>
</template>
