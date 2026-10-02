<script setup lang="ts">
import { computed } from 'vue';
import { GAME_ICONS, type GameIconName } from '@/art/icons';

const props = withDefaults(defineProps<{
  name: GameIconName;
  size?: number | string;
  /** Серая версия — например, огонь серии, пока сегодня не занимались. */
  muted?: boolean;
  /** Подпись для скринридера; без неё иконка декоративная. */
  label?: string;
}>(), {
  size: 24,
  muted: false,
  label: undefined,
});

const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size));
const markup = computed(() => GAME_ICONS[props.name]);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- разметка иконок статична и задана в коде -->
  <svg
    class="game-icon"
    :class="{ 'game-icon--muted': muted }"
    viewBox="0 0 32 32"
    :width="px"
    :height="px"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    v-html="markup"
  />
</template>

<style scoped>
.game-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

.game-icon--muted {
  filter: grayscale(1);
  opacity: 0.45;
}
</style>
