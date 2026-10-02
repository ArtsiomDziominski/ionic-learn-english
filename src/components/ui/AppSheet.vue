<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useBackButton } from '@ionic/vue';

/**
 * Нижняя шторка (на широком экране — карточка по центру).
 * Своя, а не ion-modal: ей нужна высота по содержимому, а у
 * шторок Ionic высота задаётся долями экрана. Закрывается
 * фоном, Esc и аппаратной кнопкой «назад» на Android.
 */

const props = withDefaults(defineProps<{
  open: boolean;
  label?: string;
  dismissible?: boolean;
}>(), {
  label: undefined,
  dismissible: true,
});

const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);

const close = (): void => {
  if (props.dismissible) emit('close');
};

const onKey = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') close();
};

watch(() => props.open, async (open) => {
  if (open) {
    window.addEventListener('keydown', onKey);
    await nextTick();
    panel.value?.focus();
  } else {
    window.removeEventListener('keydown', onKey);
  }
}, { immediate: true });

onBeforeUnmount(() => window.removeEventListener('keydown', onKey));

// Приоритет выше навигации Ionic: открытая шторка закрывается первой
useBackButton(150, (next) => {
  if (props.open) close();
  else next();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet" @click.self="close">
        <div
          ref="panel"
          class="sheet__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="label"
          tabindex="-1"
        >
          <div class="sheet__grip" aria-hidden="true" />
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--overlay);
  font-family: var(--font);
  color: var(--text);
}

.sheet__panel {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  overflow-y: auto;
  padding: 10px 20px calc(24px + env(safe-area-inset-bottom));
  border-radius: 28px 28px 0 0;
  background: var(--surface);
  box-shadow: var(--elev);
  outline: none;
}

.sheet__grip {
  width: 44px;
  height: 5px;
  margin: 0 auto 14px;
  border-radius: var(--r-pill);
  background: var(--line-strong);
}

@media (min-width: 720px) {
  .sheet {
    align-items: center;
  }

  .sheet__panel {
    border-radius: 28px;
    padding-bottom: 24px;
  }

  .sheet__grip {
    display: none;
  }
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 220ms var(--ease);
}

.sheet-enter-active .sheet__panel,
.sheet-leave-active .sheet__panel {
  transition: transform 320ms var(--spring);
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet__panel,
.sheet-leave-to .sheet__panel {
  transform: translateY(40px) scale(0.98);
}
</style>
