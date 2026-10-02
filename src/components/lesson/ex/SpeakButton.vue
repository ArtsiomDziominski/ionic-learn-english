<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'lg';
  slow?: boolean;
  label?: string;
}>(), {
  size: 'sm',
  slow: false,
  label: 'Прослушать',
});

defineEmits<{ play: [] }>();
</script>

<template>
  <button type="button" class="speak" :class="[`speak--${size}`, { 'speak--slow': slow }]" :aria-label="label" @click.stop="$emit('play')">
    <svg v-if="!slow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 9.2v5.6h3.8l4.9 4V5.2l-4.9 4z" fill="currentColor" />
      <path d="M15.5 8.6a4.8 4.8 0 0 1 0 6.8M18.2 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
    </svg>
    <!-- Медленное произношение — черепашка, как в Duolingo -->
    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 15.5c0-3.6 2.9-6.5 6.5-6.5S18 11.9 18 15.5z" fill="currentColor" />
      <path d="M18 13.5c1.4-.2 2.6.6 3 1.8.2.7-.3 1.2-1 1.2H18" fill="currentColor" />
      <path d="M6.5 15.5v2.5M10 15.5v2.5M13.5 15.5v2.5M17 15.5v2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
</template>

<style scoped>
.speak {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  border: none;
  background: var(--blue);
  color: #fff;
  cursor: pointer;
  transition: transform 90ms ease, box-shadow 90ms ease;
}

.speak--sm {
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  box-shadow: 0 3px 0 var(--blue-shade);
}

.speak--sm svg { width: 24px; height: 24px; }

.speak--lg {
  width: 120px;
  height: 120px;
  border-radius: var(--r-xl);
  box-shadow: 0 6px 0 var(--blue-shade);
}

.speak--lg svg { width: 64px; height: 64px; }

.speak--lg.speak--slow {
  width: 80px;
  height: 80px;
}

.speak--lg.speak--slow svg { width: 44px; height: 44px; }

.speak:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 var(--blue-shade);
}
</style>
