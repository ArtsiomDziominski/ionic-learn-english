<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useBackButton } from '@ionic/vue';

/**
 * Нижняя шторка (на широком экране — карточка по центру).
 * Своя, а не ion-modal: ей нужна высота по содержимому, а у
 * шторок Ionic высота задаётся долями экрана. Закрывается
 * фоном, Esc, аппаратной кнопкой «назад» на Android, а ещё
 * нажатием на «ручку» или её протяжкой вниз.
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

// Протяжка за «ручку»: вниз — шторка едет за пальцем и закрывается,
// вверх — растягивается с сопротивлением и возвращается обратно
const CLOSE_VELOCITY = 0.5; // px/мс
const SETTLE_MS = 260;

const offset = ref(0); // смещение пальца от точки нажатия, вниз — плюс
const baseHeight = ref<number | null>(null);
const dragging = ref(false);
const settling = ref(false);
let startY = 0;
let lastY = 0;
let lastT = 0;
let velocity = 0;
let moved = false;
let settleTimer: ReturnType<typeof setTimeout> | undefined;

const panelStyle = computed(() => {
  if (baseHeight.value === null) return undefined;
  const stretch = offset.value < 0 ? Math.min(-offset.value * 0.35, 120) : 0;
  return {
    height: `${baseHeight.value + stretch}px`,
    maxHeight: 'none',
    transform: offset.value > 0 ? `translateY(${offset.value}px)` : undefined,
    transition: dragging.value
      ? 'none'
      : settling.value
        ? `transform ${SETTLE_MS}ms var(--spring), height ${SETTLE_MS}ms var(--spring)`
        : undefined,
  };
});

const resetDrag = (): void => {
  clearTimeout(settleTimer);
  offset.value = 0;
  baseHeight.value = null;
  dragging.value = false;
  settling.value = false;
};

const settle = (): void => {
  dragging.value = false;
  settling.value = true;
  offset.value = 0;
  clearTimeout(settleTimer);
  settleTimer = setTimeout(resetDrag, SETTLE_MS);
};

const onGripDown = (e: PointerEvent): void => {
  if (!panel.value || (e.pointerType === 'mouse' && e.button !== 0)) return;
  clearTimeout(settleTimer);
  settling.value = false;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  baseHeight.value = panel.value.offsetHeight;
  startY = lastY = e.clientY;
  lastT = e.timeStamp;
  velocity = 0;
  moved = false;
  dragging.value = true;
};

const onGripMove = (e: PointerEvent): void => {
  if (!dragging.value) return;
  const dt = e.timeStamp - lastT;
  if (dt > 0) velocity = (e.clientY - lastY) / dt;
  lastY = e.clientY;
  lastT = e.timeStamp;
  offset.value = e.clientY - startY;
  if (Math.abs(offset.value) > 4) moved = true;
};

const onGripUp = (): void => {
  if (!dragging.value) return;
  const height = baseHeight.value ?? 0;
  const pulledDown = offset.value > 0 && (offset.value > Math.min(120, height / 4) || velocity > CLOSE_VELOCITY);

  if (!props.dismissible || (moved && !pulledDown)) {
    settle();
  } else if (moved) {
    // Доезжает вниз за край, пока Transition гасит фон
    dragging.value = false;
    offset.value = height;
    emit('close');
  } else {
    resetDrag();
    emit('close');
  }
};

// Нажатие с клавиатуры: у него нет pointer-событий
const onGripClick = (e: MouseEvent): void => {
  if (e.detail === 0) close();
};

watch(() => props.open, async (open) => {
  if (open) {
    resetDrag();
    window.addEventListener('keydown', onKey);
    await nextTick();
    panel.value?.focus();
  } else {
    window.removeEventListener('keydown', onKey);
  }
}, { immediate: true });

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  clearTimeout(settleTimer);
});

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
          :style="panelStyle"
        >
          <button
            type="button"
            class="sheet__handle"
            aria-label="Закрыть"
            :tabindex="dismissible ? 0 : -1"
            @pointerdown="onGripDown"
            @pointermove="onGripMove"
            @pointerup="onGripUp"
            @pointercancel="settle"
            @click="onGripClick"
          >
            <span class="sheet__grip" aria-hidden="true" />
          </button>
          <div class="sheet__body">
            <slot />
          </div>
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
  display: flex;
  flex-direction: column;
  width: 100%;
  /* Не выше 75% экрана: над шторкой всегда остаётся фон, по которому её можно закрыть */
  max-height: 75vh;
  max-height: 75dvh;
  border-radius: 28px 28px 0 0;
  background: var(--surface);
  box-shadow: var(--elev);
  outline: none;
}

/* «Ручка» вне прокрутки: остаётся на месте, когда список листают */
.sheet__handle {
  display: block;
  flex-shrink: 0;
  width: 100%;
  padding: 10px 0 14px;
  border: none;
  background: none;
  cursor: grab;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.sheet__handle:active {
  cursor: grabbing;
}

.sheet__grip {
  display: block;
  width: 44px;
  height: 5px;
  margin: 0 auto;
  border-radius: var(--r-pill);
  background: var(--line-strong);
}

.sheet__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 20px calc(24px + env(safe-area-inset-bottom));
}

@media (min-width: 720px) {
  .sheet {
    align-items: center;
  }

  .sheet__panel {
    max-width: 520px;
    max-height: 92vh;
    border-radius: 28px;
  }

  .sheet__handle {
    display: none;
  }

  .sheet__body {
    padding-top: 10px;
    padding-bottom: 24px;
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
