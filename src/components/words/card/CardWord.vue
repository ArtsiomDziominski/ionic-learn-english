<template>
  <div class="option" :class="`option--${color}`">
    <span class="option__text">{{ word }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  word: {
    type: String,
    required: true
  },
  /** 'medium' — обычное состояние, 'success' — верный ответ, 'danger' — неверный */
  color: {
    type: String,
    default: 'medium'
  },
});
</script>

<style scoped lang="scss">
/* Вариант ответа. Раньше это была ion-card color="primary": все
   четыре варианта были залиты брендовым цветом, из-за чего верный
   и неверный ответ читались хуже, чем должны. */
.option {
  width: 100%;
  height: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--app-sp-3);
  box-sizing: border-box;
  text-align: center;
  border-radius: var(--app-r-md);
  background: var(--app-surface-2);
  border: 1.5px solid var(--app-border);
  color: var(--app-text);
  transition: background-color var(--app-dur-base) var(--app-ease),
              border-color var(--app-dur-base) var(--app-ease),
              color var(--app-dur-base) var(--app-ease);

  &__text {
    font-size: var(--app-fs-body);
    font-weight: 600;
    line-height: 1.3;
  }

  /* Состояние передаётся и цветом, и рамкой — одного цвета мало
     при дальтонизме */
  &--success {
    background: var(--app-tint-success);
    border-color: var(--ion-color-success);
    color: var(--app-success-ink);
  }

  &--danger {
    background: var(--app-tint-danger);
    border-color: var(--ion-color-danger);
    color: var(--app-danger-ink);
  }
}
</style>
