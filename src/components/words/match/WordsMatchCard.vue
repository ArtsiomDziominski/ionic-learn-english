<script setup lang="ts">
defineProps({
  word: {
    type: String,
    required: true
  },
  /** '' — обычное, 'primary' — выбрано, 'success' — пара найдена, 'danger' — ошибка */
  color: {
    type: String,
    required: false,
    default: ''
  }
});
</script>

<template>
  <div class="match-card" :class="color ? `match-card--${color}` : ''">
    {{ word }}
  </div>
</template>

<style scoped lang="scss">
.match-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: var(--app-sp-3) var(--app-sp-2);
  box-sizing: border-box;
  text-align: center;
  font-size: var(--app-fs-sm);
  font-weight: 600;
  line-height: 1.25;
  border-radius: var(--app-r-md);
  background: var(--app-surface-2);
  border: 1.5px solid var(--app-border);
  color: var(--app-text);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--app-dur-base) var(--app-ease),
              border-color var(--app-dur-base) var(--app-ease),
              color var(--app-dur-base) var(--app-ease),
              opacity var(--app-dur-base) var(--app-ease);

  &:active {
    transform: scale(0.97);
  }

  &--primary {
    background: var(--app-tint-primary);
    border-color: var(--ion-color-primary);
    color: var(--app-accent-ink);
  }

  /* Найденная пара гаснет, но остаётся на месте: так виден
     прогресс и не прыгает раскладка */
  &--success {
    background: var(--app-tint-success);
    border-color: var(--ion-color-success);
    color: var(--app-success-ink);
    opacity: 0.55;
    pointer-events: none;
  }

  &--danger {
    background: var(--app-tint-danger);
    border-color: var(--ion-color-danger);
    color: var(--app-danger-ink);
  }
}
</style>
