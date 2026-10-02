<script setup lang="ts">
import { computed } from 'vue';
import { getWord, type CourseUnit, type NodeState, type PathNode } from '@/core/course';
import { plural } from '@/core/dates';

const props = defineProps<{
  node: PathNode;
  unit: CourseUnit;
  state: NodeState;
  lessonCount: number;
  /** Сдвиг узла от центра — стрелка карточки указывает на него. */
  arrow?: number;
}>();

defineEmits<{ start: []; close: [] }>();

const lesson = computed(() => (props.node.kind === 'chest' ? null : props.node.lesson));

const title = computed(() => {
  if (props.node.kind === 'review') return 'Повторение юнита';
  if (props.node.kind === 'chest') return 'Сундук';
  return `Урок ${(lesson.value?.index ?? 0) + 1} из ${props.lessonCount}`;
});

/** Слова урока — видно, что ждёт впереди */
const words = computed(() => {
  if (props.node.kind !== 'lesson' || props.state === 'locked') return '';
  return (lesson.value?.words ?? []).map((id) => getWord(id)?.word ?? id).join(', ');
});

const text = computed(() => {
  if (props.state === 'locked') return 'Пройдите все уроки выше, чтобы открыть этот.';
  if (props.node.kind === 'review') return `Закрепите все ${props.unit.words.length} ${plural(props.unit.words.length, 'слово', 'слова', 'слов')} юнита и получите кубок.`;
  const n = lesson.value?.words.length ?? 0;
  if (props.state === 'done') return 'Урок пройден. Повторите, чтобы закрепить слова.';
  return `${n} ${plural(n, 'новое слово', 'новых слова', 'новых слов')} и задания на запоминание.`;
});

const action = computed(() => {
  if (props.state === 'locked') return null;
  if (props.state === 'done') return 'Повторить +5 XP';
  return props.node.kind === 'review' ? 'Начать +20 XP' : 'Начать +10 XP';
});
</script>

<template>
  <div
    class="pop"
    :class="{ 'pop--locked': state === 'locked' }"
    :style="{ '--arrow': `${arrow ?? 0}px` }"
    role="dialog"
    :aria-label="title"
  >
    <h3 class="pop__title">{{ title }}</h3>
    <p v-if="words" class="pop__words">{{ words }}</p>
    <p class="pop__text">{{ text }}</p>
    <button v-if="action" type="button" class="pop__btn" @click="$emit('start')">
      {{ action }}
    </button>
  </div>
</template>

<style scoped>
/* Бумажная карточка урока */
.pop {
  position: relative;
  width: min(320px, calc(100vw - 48px));
  padding: 16px;
  border: 2px solid var(--paper-line);
  border-radius: 20px;
  background: var(--paper);
  color: var(--paper-ink);
  text-align: left;
  animation: pop 260ms var(--spring) both;
  box-shadow: var(--paper-shadow), 0 20px 34px -22px rgba(70, 50, 20, 0.6);
}

.pop::before {
  content: '';
  position: absolute;
  top: -9px;
  left: calc(50% + var(--arrow, 0px));
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border-top: 2px solid var(--paper-line);
  border-left: 2px solid var(--paper-line);
  border-radius: 3px 0 0 0;
  background: var(--paper);
  transform: rotate(45deg);
}

.pop__title {
  color: inherit;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
}

.pop__words {
  margin-top: 4px;
  color: var(--leaf-ink);
  font-size: 0.95rem;
  font-weight: 800;
}

.pop__text {
  margin-top: 4px;
  color: var(--paper-muted);
  font-size: 0.92rem;
}

.pop__btn {
  width: 100%;
  min-height: 48px;
  margin-top: 14px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(180deg, var(--leaf), var(--leaf-shade));
  color: #fff;
  font-size: 0.98rem;
  font-weight: 800;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 10px 18px -10px var(--leaf-shade);
  cursor: pointer;
  transition: transform 120ms ease, filter 150ms ease;
}

.pop__btn:hover {
  filter: brightness(1.05);
}

.pop__btn:active {
  transform: scale(0.97);
}
</style>
