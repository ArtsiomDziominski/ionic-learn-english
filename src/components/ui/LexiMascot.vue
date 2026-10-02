<script setup lang="ts">
import { computed } from 'vue';
import { renderLexi, type LexiMood, type LexiView } from '@/art/lexi';

const props = withDefaults(defineProps<{
  view?: LexiView;
  mood?: LexiMood;
  size?: number | string;
  flip?: boolean;
  animated?: boolean;
  /** Только голова — для аватара. */
  head?: boolean;
  shadow?: boolean;
  label?: string;
}>(), {
  view: 'front',
  mood: 'idle',
  size: 160,
  flip: false,
  animated: true,
  head: false,
  shadow: undefined,
  label: 'Лекси',
});

/* У каждого экземпляра свои id градиентов: одинаковые id в разных
   SVG ломают заливку, если первый из них скрыт (display: none). */
const uid = `lexi-${Math.random().toString(36).slice(2, 9)}`;

const svg = computed(() =>
  renderLexi({
    view: props.view,
    mood: props.mood,
    flip: props.flip,
    crop: props.head ? 'head' : 'full',
    shadow: props.shadow,
    uid,
  }));

const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- SVG персонажа собирается в коде, пользовательских данных в нём нет -->
  <span
    class="lexi"
    :class="{ 'lexi--animated': animated }"
    :style="{ width: px, height: px }"
    role="img"
    :aria-label="label"
    v-html="svg"
  />
</template>

<style scoped>
.lexi {
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
}
</style>
