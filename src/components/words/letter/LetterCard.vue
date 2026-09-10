<script setup lang="ts">
import {PropType} from "vue";

defineProps({
  letter: {
    type: Object as PropType<string>,
    required: true
  },
  count: {
    type: Number,
    required: false,
    default: 0
  },
});
</script>

<template>
  <div class="key">
    <span class="key__letter">{{ letter }}</span>
    <span v-if="count > 1" class="key__count app-nums">{{ count }}</span>
  </div>
</template>

<style scoped lang="scss">
/* Буква-клавиша. Размер 56px — выше минимума в 44px, попасть
   пальцем можно не глядя. */
.key {
  position: relative;
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: var(--app-r-md);
  background: var(--app-surface-2);
  border: 1.5px solid var(--app-border);
  color: var(--app-text);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--app-dur-fast) var(--app-ease),
              background-color var(--app-dur-fast) var(--app-ease);

  &:hover {
    background: var(--app-surface-3);
  }

  &:active {
    transform: scale(0.92);
  }

  &__letter {
    font-size: 26px;
    font-weight: 600;
    line-height: 1;
  }

  /* Сколько раз буква ещё встречается в слове */
  &__count {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    border-radius: var(--app-r-pill);
    background: var(--ion-color-primary);
    color: var(--app-text-on-accent);
    font-size: var(--app-fs-caption);
    font-weight: 700;
  }
}
</style>
