<script setup lang="ts">
import { computed } from 'vue';
import type { NodeState, PathNode } from '@/core/course';
import { nodeArt, type Biome } from '@/art/scenery';

const props = defineProps<{
  node: PathNode;
  state: NodeState;
  /** Локация юнита: пенёк, кувшинка или камень. */
  biome: Biome;
  offset: number;
  selected: boolean;
  /** Подпись над текущим узлом. */
  hint?: string;
  /** Сдвиг подписи в сторону от соседнего узла сверху. */
  hintShift?: number;
}>();

defineEmits<{ select: [] }>();

const label = computed(() => {
  if (props.node.kind === 'chest') return props.state === 'done' ? 'Открытый сундук' : 'Сундук с кристаллами';
  const base = props.node.kind === 'review' ? 'Повторение юнита' : `Урок ${props.node.lesson.index + 1}`;
  const state = props.state === 'done' ? 'пройден' : props.state === 'current' ? 'текущий' : 'закрыт';
  return `${base}, ${state}`;
});

const art = computed(() => nodeArt({ kind: props.node.kind, state: props.state, biome: props.biome }));
</script>

<template>
  <div class="slot" :style="{ transform: `translateX(${offset}px)` }">
    <div
      v-if="state === 'current' && hint && !selected"
      class="hint"
      :style="{ '--shift': `${hintShift ?? 0}px` }"
      aria-hidden="true"
    >
      {{ hint }}
    </div>

    <button
      type="button"
      class="node"
      :class="[`node--${state}`, `node--${node.kind}`, { 'node--selected': selected }]"
      :aria-label="label"
      @click="$emit('select')"
    >
      <!-- eslint-disable-next-line vue/no-v-html -- картинка узла собирается в коде, пользовательских данных в ней нет -->
      <span class="node__art" v-html="art" />
    </button>
  </div>
</template>

<style scoped>
.slot {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 300ms var(--ease);
}

.node {
  position: relative;
  display: block;
  width: 100px;
  height: 92px;
  padding: 0;
  border: none;
  border-radius: 24px;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.node:focus-visible {
  outline: 3px solid var(--leaf);
  outline-offset: 2px;
}

.node__art {
  display: block;
  line-height: 0;
  transition: transform 160ms ease;
}

.node:active .node__art,
.node--selected .node__art {
  transform: translateY(2px) scale(0.96);
}

/* Закрытые уроки — выцветшие, будто ещё в тени */
.node--locked:not(.node--chest) .node__art {
  filter: saturate(0.35);
  opacity: 0.9;
}

/* Подсказка «Начать» — табличка с хвостиком к узлу */
.hint {
  position: absolute;
  bottom: calc(50% + 34px);
  z-index: 4;
  padding: 7px 15px;
  border: 2px solid var(--paper-line);
  border-radius: 14px;
  background: var(--paper);
  color: var(--paper-ink);
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 10px 18px -10px rgba(70, 50, 20, 0.6);
  transform: translateX(var(--shift, 0px));
  animation: hint-bob 1.8s ease-in-out infinite;
}

.hint::after {
  content: '';
  position: absolute;
  left: calc(50% - var(--shift, 0px));
  bottom: -7px;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-right: 2px solid var(--paper-line);
  border-bottom: 2px solid var(--paper-line);
  border-radius: 0 0 3px 0;
  background: var(--paper);
  transform: rotate(45deg);
}

@keyframes hint-bob {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -5px; }
}
</style>
