<script setup lang="ts">
import { computed } from 'vue';
import type { CourseSection, CourseUnit } from '@/core/course';
import { BIOME_ICONS, type Biome } from '@/art/scenery';

const props = defineProps<{ unit: CourseUnit; section: CourseSection; biome: Biome; done: number; total: number }>();
defineEmits<{ guide: [] }>();

const eyebrow = computed(() => (props.section.kind === 'level'
  ? `${props.biome.name} · раздел ${props.section.number}, ${props.section.badge}`
  : `${props.biome.name} · тема`));
</script>

<template>
  <header class="sign">
    <i class="sign__nail sign__nail--tl" aria-hidden="true" />
    <i class="sign__nail sign__nail--tr" aria-hidden="true" />
    <i class="sign__nail sign__nail--bl" aria-hidden="true" />
    <i class="sign__nail sign__nail--br" aria-hidden="true" />

    <span class="sign__icon" aria-hidden="true">
      <!-- eslint-disable-next-line vue/no-v-html -- значок локации — статичная SVG-разметка из кода -->
      <svg viewBox="0 0 32 32" v-html="BIOME_ICONS[biome.id]" />
    </span>

    <div class="sign__text">
      <p class="sign__eyebrow">{{ eyebrow }}</p>
      <h2 class="sign__title">{{ unit.title }}</h2>
      <p class="sign__sub">{{ unit.subtitle }}</p>
      <div class="sign__acorns" role="img" :aria-label="`Пройдено ${done} из ${total}`">
        <svg v-for="i in total" :key="i" class="acorn" :class="{ 'acorn--on': i <= done }" viewBox="0 0 14 16" aria-hidden="true">
          <path class="acorn__stem" d="M7 1.2 V3.6" />
          <path class="acorn__nut" d="M2.6 7 C2.6 11 4.6 14.6 7 14.6 C9.4 14.6 11.4 11 11.4 7Z" />
          <path class="acorn__cap" d="M1.4 7.4 C1.2 4.6 3.6 3 7 3 C10.4 3 12.8 4.6 12.6 7.4Z" />
        </svg>
        <b class="nums">{{ done }}/{{ total }}</b>
      </div>
    </div>

    <button type="button" class="sign__guide" aria-label="Слова юнита" @click="$emit('guide')">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 6.5A2.5 2.5 0 0 1 8.5 4H25v20H8.5A2.5 2.5 0 0 0 6 26.5zM6 26.5A2.5 2.5 0 0 0 8.5 29H25v-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" />
        <path d="M11 10h9M11 15h6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      </svg>
    </button>
  </header>
</template>

<style scoped>
/* Деревянная табличка: две доски, гвоздики по углам */
.sign {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px 12px;
  border-radius: 16px;
  color: var(--wood-ink);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0) 40%),
    linear-gradient(180deg, transparent calc(50% - 1px), var(--wood-seam) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 11px, rgba(60, 30, 10, 0.07) 11px 13px, transparent 13px 23px),
    linear-gradient(180deg, var(--wood-1), var(--wood-2));
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.22), inset 0 -3px 0 rgba(60, 30, 10, 0.3);
}

.sign__nail {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #F0E6D6, #8E8476);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
}

.sign__nail--tl { top: 9px; left: 9px; }
.sign__nail--tr { top: 9px; right: 9px; }
.sign__nail--bl { bottom: 9px; left: 9px; }
.sign__nail--br { bottom: 9px; right: 9px; }

.sign__icon,
.sign__guide {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #FFF4DE;
  box-shadow: inset 0 -3px 0 rgba(120, 80, 30, 0.18), 0 2px 0 rgba(60, 30, 10, 0.3);
}

.sign__icon svg {
  width: 28px;
  height: 28px;
}

.sign__text {
  flex: 1;
  min-width: 0;
}

.sign__eyebrow {
  overflow: hidden;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.88;
  text-shadow: 0 1px 0 rgba(60, 30, 10, 0.4);
}

.sign__title {
  margin-top: 2px;
  overflow: hidden;
  color: inherit;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-shadow: 0 2px 0 rgba(60, 30, 10, 0.35);
}

.sign__sub {
  margin-top: 2px;
  overflow: hidden;
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
  opacity: 0.92;
}

.sign__acorns {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
}

.sign__acorns b {
  margin-left: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  opacity: 0.9;
}

.acorn {
  width: 13px;
  height: 15px;
}

.acorn__stem {
  stroke: #5A3A1E;
  stroke-width: 1.4;
  stroke-linecap: round;
}

.acorn__nut { fill: rgba(255, 244, 222, 0.35); }
.acorn__cap { fill: rgba(255, 244, 222, 0.5); }
.acorn--on .acorn__nut { fill: #E9B26B; }
.acorn--on .acorn__cap { fill: #6B4426; }

.sign__guide {
  border: none;
  color: #7A4C29;
  cursor: pointer;
  transition: transform 120ms ease;
}

.sign__guide:active {
  transform: scale(0.94);
}

.sign__guide svg {
  width: 22px;
  height: 22px;
}
</style>
