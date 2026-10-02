<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, type ComponentPublicInstance } from 'vue';
import { IonContent, IonHeader, IonPage, onIonViewDidEnter, useIonRouter } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import {
  SECTIONS, sectionNodeStates, firstOpenLesson,
  type CourseUnit, type NodeState, type PathNode as PathNodeT,
} from '@/core/course';
import type { LexiMood, LexiView } from '@/art/lexi';
import { biomeAt, edgeArt, sceneArt, seedOf } from '@/art/scenery';
import { useProgressStore } from '@/store/progress';
import { useSound } from '@/composables/useSound';
import { hapticTap } from '@/composables/useHaptics';
import { useSEO } from '@/composables/useSEO';
import { useWebApplicationSchema } from '@/composables/useStructuredData';
import LearnTopBar from '@/components/learn/LearnTopBar.vue';
import DailyCard from '@/components/learn/DailyCard.vue';
import UnitHeader from '@/components/learn/UnitHeader.vue';
import PathNode from '@/components/learn/PathNode.vue';
import NodePopover from '@/components/learn/NodePopover.vue';
import SectionSheet from '@/components/learn/SectionSheet.vue';
import StreakSheet from '@/components/learn/StreakSheet.vue';
import HeartsSheet from '@/components/learn/HeartsSheet.vue';
import GemsSheet from '@/components/learn/GemsSheet.vue';
import QuestsSheet from '@/components/learn/QuestsSheet.vue';
import ChestSheet from '@/components/learn/ChestSheet.vue';
import UnitWordsSheet from '@/components/learn/UnitWordsSheet.vue';
import WelcomeFlow from '@/components/learn/WelcomeFlow.vue';
import LexiMascot from '@/components/ui/LexiMascot.vue';
import GameIcon from '@/components/ui/GameIcon.vue';
import AppFooter from '@/components/AppFooter.vue';

type Panel = 'section' | 'streak' | 'gems' | 'hearts' | 'quests' | 'chest' | 'words' | null;
type ScrollHost = HTMLElement & {
  getScrollElement: () => Promise<HTMLElement>;
  scrollToPoint: (x: number, y: number, d: number) => Promise<void>;
};

const progress = useProgressStore();
const router = useIonRouter();
const { play } = useSound();
const { state, currentSection: section, streakNotice, hearts, heartsEnabled } = storeToRefs(progress);

const content = ref<InstanceType<typeof IonContent> | null>(null);
const panel = ref<Panel>(null);
const selected = ref<string | null>(null);
const guideUnit = ref<CourseUnit | null>(null);
const chestAmount = ref(0);
const heartsReason = ref<string | undefined>(undefined);

/* ——— Состояние пути ——————————————————————————————————————— */

const states = computed(() =>
  sectionNodeStates(section.value, progress.isLessonDone, progress.isChestOpen));

const stateOf = (id: string): NodeState => states.value.get(id) ?? 'locked';

/* Змейка: смещения повторяют плавную синусоиду через весь раздел */
const ZIGZAG = [0, 46, 74, 46, 0, -46, -74, -46];
const offsets = computed(() => {
  const map = new Map<string, number>();
  let i = 0;
  for (const unit of section.value.units) {
    for (const node of unit.nodes) map.set(node.id, ZIGZAG[i++ % ZIGZAG.length]);
  }
  return map;
});
const offsetOf = (id: string): number => offsets.value.get(id) ?? 0;

/** Подсказка «Начать» уходит в сторону от соседнего узла сверху. */
const hintShift = (unit: CourseUnit, index: number): number => {
  const prev = unit.nodes[index - 1];
  if (!prev) return 0;
  return offsetOf(prev.id) > offsetOf(unit.nodes[index].id) ? -14 : 14;
};

const unitStats = (unit: CourseUnit): { done: number; total: number } => {
  const lessons = unit.nodes.filter((n) => n.kind !== 'chest');
  return { done: lessons.filter((n) => progress.isLessonDone(n.id)).length, total: lessons.length };
};

/* Лекси стоит у пути в каждом юните — в разных ракурсах и позах */
const POSES: Array<{ view: LexiView; mood: LexiMood }> = [
  { view: 'front', mood: 'wave' },
  { view: 'threeQuarter', mood: 'idle' },
  { view: 'side', mood: 'run' },
  { view: 'front', mood: 'read' },
  { view: 'back', mood: 'idle' },
  { view: 'front', mood: 'think' },
  { view: 'threeQuarter', mood: 'talk' },
  { view: 'front', mood: 'sleep' },
];

const ROW = 104;

const mascotFor = (unit: CourseUnit, unitIndex: number) => {
  // Ставим персонажа напротив самого дальнего изгиба пути в юните
  let best = 0;
  let bestAbs = -1;
  unit.nodes.forEach((n, i) => {
    const abs = Math.abs(offsetOf(n.id));
    if (abs > bestAbs && i > 0) {
      bestAbs = abs;
      best = i;
    }
  });
  const side = offsetOf(unit.nodes[best].id) > 0 ? -1 : 1;
  const pose = POSES[(unitIndex + section.value.number) % POSES.length];
  const turns = pose.view === 'threeQuarter' || pose.view === 'side';
  const top = best * ROW + ROW / 2 - 60;
  return {
    pose,
    side,
    top,
    // Профиль и вполоборота смотрят вправо; справа от пути разворачиваем к нему
    flip: turns && side > 0,
    style: { top: `${top}px`, left: `calc(50% + ${side * 108}px - 60px)` },
  };
};

const lessonCount = (unit: CourseUnit): number => unit.nodes.filter((n) => n.kind === 'lesson').length;

/* ——— Мир Лекси: локации и декорации ———————————————————————— */

const unitIndexOf = computed(() => new Map(section.value.units.map((u, i) => [u.id, i])));
const biomeOfUnit = (unit: CourseUnit) => biomeAt(unitIndexOf.value.get(unit.id) ?? 0);
const lastBiome = computed(() => biomeAt(Math.max(0, section.value.units.length - 1)));

/** Переходы между локациями — край прошлой земли сверху юнита. */
const edges = computed(() => section.value.units.map((unit, i) =>
  (i > 0 ? edgeArt(biomeAt(i - 1), biomeAt(i), seedOf(`${unit.id}:edge`)) : '')));

/* Природу рисуем только у юнитов рядом с экраном — длинный раздел
   «Темы» иначе держал бы в документе тысячи SVG-деталей. */
const near = ref<Set<string>>(new Set());
const unitEls = new Map<string, HTMLElement>();
const NEAR_MARGIN = 900;

const setUnitEl = (id: string, el: Element | ComponentPublicInstance | null): void => {
  if (el instanceof HTMLElement) unitEls.set(id, el);
  else unitEls.delete(id);
};

/** До первой прокрутки — юниты вокруг текущего урока. */
function seedNear(): void {
  const units = section.value.units;
  const cur = Math.max(0, units.findIndex((u) => u.nodes.some((n) => stateOf(n.id) === 'current')));
  near.value = new Set([units[0]?.id, ...units.slice(Math.max(0, cur - 1), cur + 2).map((u) => u.id)].filter(Boolean) as string[]);
}

let viewHeight = 800;
function updateNear(scrollTop: number): void {
  if (!unitEls.size) return;
  const next = new Set<string>();
  for (const [id, el] of unitEls) {
    const top = el.offsetTop;
    if (top + el.offsetHeight > scrollTop - NEAR_MARGIN && top < scrollTop + viewHeight + NEAR_MARGIN) next.add(id);
  }
  if (next.size !== near.value.size || [...next].some((id) => !near.value.has(id))) near.value = next;
}

let scrollFrame = 0;
const onScroll = (e: CustomEvent<{ scrollTop: number }>): void => {
  const top = e.detail.scrollTop;
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateNear(top);
  });
};

async function refreshNear(): Promise<void> {
  await nextTick();
  const el = content.value?.$el as ScrollHost | undefined;
  if (!el?.getScrollElement) return;
  const scroller = await el.getScrollElement();
  viewHeight = scroller.clientHeight || viewHeight;
  updateNear(scroller.scrollTop);
}

/* Сцена зависит только от юнита и состояний его узлов — кешируем */
const sceneCache = new Map<string, { back: string; front: string }>();

const sceneOf = (unit: CourseUnit, unitIndex: number): { back: string; front: string } | null => {
  if (!near.value.has(unit.id)) return null;
  const nodeStates = unit.nodes.map((n) => stateOf(n.id));
  const mascot = mascotFor(unit, unitIndex);
  const key = `${unit.id}|${unitIndex}|${nodeStates.join(',')}|${mascot.top}|${mascot.side}`;
  let scene = sceneCache.get(key);
  if (!scene) {
    scene = sceneArt({
      biome: biomeAt(unitIndex),
      nodes: unit.nodes.map((n, i) => ({ kind: n.kind, state: nodeStates[i], x: offsetOf(n.id), y: i * ROW + ROW / 2 })),
      height: unit.nodes.length * ROW,
      seed: seedOf(unit.id),
      mascot: { top: mascot.top, side: mascot.side },
      home: unitIndex === 0,
    });
    if (sceneCache.size > 80) sceneCache.clear();
    sceneCache.set(key, scene);
  }
  return scene;
};

/* ——— Действия ———————————————————————————————————————————— */

const onSelect = (node: PathNodeT): void => {
  hapticTap();
  play('tap');
  if (node.kind === 'chest') {
    const s = stateOf(node.id);
    if (s === 'open') {
      chestAmount.value = progress.openChest(node.id);
      panel.value = 'chest';
      selected.value = null;
      return;
    }
  }
  selected.value = selected.value === node.id ? null : node.id;
};

const start = (node: PathNodeT): void => {
  if (node.kind === 'chest') return;
  if (heartsEnabled.value && hearts.value <= 0) {
    heartsReason.value = 'Чтобы начать урок, нужна хотя бы одна жизнь.';
    panel.value = 'hearts';
    return;
  }
  selected.value = null;
  router.push(`/lesson/${node.id}`);
};

const openPanel = (p: Panel): void => {
  heartsReason.value = undefined;
  selected.value = null;
  panel.value = p;
};

const openGuide = (unit: CourseUnit): void => {
  guideUnit.value = unit;
  panel.value = 'words';
};

/** Клик мимо узла закрывает карточку урока. */
const onBackgroundClick = (e: MouseEvent): void => {
  if (!(e.target as HTMLElement).closest('.slot, .pop')) selected.value = null;
};

const currentId = computed(() => {
  for (const [id, s] of states.value) if (s === 'current') return id;
  return null;
});

const sectionDone = computed(() => !firstOpenLesson(section.value, progress.isLessonDone));
const nextSection = computed(() => {
  const i = SECTIONS.findIndex((s) => s.id === section.value.id);
  return SECTIONS[i + 1] ?? null;
});

async function scrollToCurrent(smooth = true): Promise<void> {
  await nextTick();
  const id = currentId.value;
  const el = content.value?.$el as ScrollHost | undefined;
  if (!id || !el?.getScrollElement) return;
  const row = document.getElementById(`node-${id}`);
  if (!row) return;
  const scroller = await el.getScrollElement();
  const top = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  const target = Math.max(0, top - scroller.clientHeight * 0.4);
  // Природу вокруг цели рисуем заранее, чтобы она не появлялась на глазах
  viewHeight = scroller.clientHeight || viewHeight;
  updateNear(target);
  await el.scrollToPoint(0, target, smooth ? 450 : 0);
}

const changeSection = (id: string): void => {
  progress.setSection(id);
  selected.value = null;
  void scrollToCurrent(false);
};

watch(section, () => {
  seedNear();
  void scrollToCurrent(false).then(refreshNear);
});

seedNear();

onMounted(() => {
  useSEO({
    title: 'Изучение английских слов онлайн тренажер бесплатно',
    description: 'Изучайте английские слова легко и эффективно с помощью интерактивных упражнений. Карточки, тесты и игры для быстрого запоминания слов. Бесплатный онлайн тренажер для всех уровней.',
    keywords: 'английские слова, изучение английского, тренажер слов, карточки английского, учить слова онлайн, vocabulary trainer, английский бесплатно',
    url: 'https://www.learnenglisheasy.ru/words',
  });
  useWebApplicationSchema();
  void refreshNear();
});

onIonViewDidEnter(() => {
  selected.value = null;
  void scrollToCurrent();
});
</script>

<template>
  <ion-page>
    <ion-header class="learn-header">
      <LearnTopBar :section="section" @open="openPanel" />
    </ion-header>

    <ion-content ref="content" class="learn-content" :scroll-events="true" @ion-scroll="onScroll">
      <!-- Природа шире колонки: обрезаем её по краю экрана, иначе страницу можно сдвинуть вбок -->
      <div class="learn-world">
        <div class="learn page" @click="onBackgroundClick">
          <div v-if="streakNotice" class="notice" :class="`notice--${streakNotice.kind}`">
            <GameIcon :name="streakNotice.kind === 'frozen' ? 'freeze' : 'flame'" :size="36" :muted="streakNotice.kind === 'lost'" />
            <p class="grow">
              {{ streakNotice.kind === 'frozen' ? 'Заморозка сохранила вашу серию, пока вас не было!' : 'Серия прервалась. Начните новую сегодня — всё получится!' }}
            </p>
            <button type="button" class="notice__close" aria-label="Скрыть" @click="progress.streakNotice = null">×</button>
          </div>

          <DailyCard @quests="openPanel('quests')" />

          <section
            v-for="(unit, unitIndex) in section.units"
            :key="unit.id"
            :ref="(el) => setUnitEl(unit.id, el)"
            class="unit-block"
            :class="[`ground--${biomeOfUnit(unit).id}`, { 'unit-block--first': unitIndex === 0 }]"
          >
            <!-- eslint-disable-next-line vue/no-v-html -- край локации — SVG из src/art/scenery.ts -->
            <div v-if="unitIndex > 0" class="unit-edge" aria-hidden="true" v-html="edges[unitIndex]" />

            <div class="unit-sticky">
              <UnitHeader
                :unit="unit"
                :section="section"
                :biome="biomeOfUnit(unit)"
                :done="unitStats(unit).done"
                :total="unitStats(unit).total"
                @guide="openGuide(unit)"
              />
            </div>

            <div class="path" :style="{ height: `${unit.nodes.length * ROW}px` }">
              <!-- eslint-disable-next-line vue/no-v-html -- природа и тропинка — SVG из src/art/scenery.ts -->
              <div v-if="sceneOf(unit, unitIndex)" class="scene scene--back" aria-hidden="true" v-html="sceneOf(unit, unitIndex)?.back" />

              <div
                v-for="(node, nodeIndex) in unit.nodes"
                :id="`node-${node.id}`"
                :key="node.id"
                class="path__row"
                :class="{ 'path__row--open': selected === node.id }"
              >
                <PathNode
                  :node="node"
                  :state="stateOf(node.id)"
                  :biome="biomeOfUnit(unit)"
                  :offset="offsetOf(node.id)"
                  :selected="selected === node.id"
                  :hint="node.kind === 'review' ? 'Кубок' : 'Начать'"
                  :hint-shift="hintShift(unit, nodeIndex)"
                  @select="onSelect(node)"
                />
                <div v-if="selected === node.id && node.kind !== 'chest'" class="path__pop">
                  <NodePopover
                    :node="node"
                    :unit="unit"
                    :state="stateOf(node.id)"
                    :lesson-count="lessonCount(unit)"
                    :arrow="offsetOf(node.id)"
                    @start="start(node)"
                  />
                </div>
              </div>

              <div class="path__mascot" :style="mascotFor(unit, unitIndex).style" aria-hidden="true">
                <LexiMascot
                  :view="mascotFor(unit, unitIndex).pose.view"
                  :mood="mascotFor(unit, unitIndex).pose.mood"
                  :flip="mascotFor(unit, unitIndex).flip"
                  :size="120"
                />
              </div>

              <!-- eslint-disable-next-line vue/no-v-html -- деревья и травы перед тропинкой -->
              <div v-if="sceneOf(unit, unitIndex)" class="scene scene--front" aria-hidden="true" v-html="sceneOf(unit, unitIndex)?.front" />
            </div>
          </section>

          <div class="outro" :class="`ground--${lastBiome.id}`">
            <section class="end">
              <LexiMascot :mood="sectionDone ? 'cheer' : 'happy'" :size="110" />
              <div class="grow">
                <h3>{{ sectionDone ? 'Раздел пройден!' : 'Впереди ещё много интересного' }}</h3>
                <p class="end__text">
                  {{ nextSection ? `Следующий раздел — ${nextSection.title}.` : 'Это последний раздел курса.' }}
                </p>
                <button v-if="nextSection" type="button" class="end__btn" @click="changeSection(nextSection.id)">
                  Перейти: {{ nextSection.badge }}
                </button>
              </div>
            </section>

            <div class="outro__footer">
              <AppFooter />
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <SectionSheet :open="panel === 'section'" @close="panel = null" @select="changeSection" />
    <StreakSheet :open="panel === 'streak'" @close="panel = null" />
    <HeartsSheet :open="panel === 'hearts'" :reason="heartsReason" @close="panel = null" />
    <GemsSheet :open="panel === 'gems'" @close="panel = null" />
    <QuestsSheet :open="panel === 'quests'" @close="panel = null" />
    <ChestSheet :open="panel === 'chest'" :amount="chestAmount" @close="panel = null" />
    <UnitWordsSheet :open="panel === 'words'" :unit="guideUnit" @close="panel = null" />

    <WelcomeFlow v-if="!state.onboarded" @done="scrollToCurrent()" />
  </ion-page>
</template>

<style scoped>
.learn-header {
  background: var(--paper-bar);
  border-bottom: 2px solid var(--paper-line);
  padding-top: env(safe-area-inset-top);
}

/* Над первым юнитом — та же трава, что на опушке */
.learn-content {
  --background: var(--g-forest);
}

/* clip, а не hidden: hidden сделал бы обёртку прокручиваемой и сломал липкие шапки юнитов */
.learn-world {
  width: 100%;
  overflow-x: clip;
}

.learn {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: 40px;
}

.notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid var(--paper-line);
  border-radius: 20px;
  background: var(--paper);
  box-shadow: var(--paper-shadow);
  color: var(--paper-ink);
  font-weight: 800;
}

.notice--frozen { border-color: var(--blue); }

.notice__close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--paper-subtle);
  font-size: 1.6rem;
  cursor: pointer;
}

/* ——— Юнит: своя земля на всю ширину экрана ——— */

.unit-block {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.unit-block:not(.unit-block--first) {
  padding-top: 28px;
}

.unit-block::before,
.outro::before {
  content: '';
  position: absolute;
  top: -18px;
  bottom: 0;
  left: calc(50% - 50vw);
  right: calc(50% - 50vw);
  z-index: -2;
  background:
    radial-gradient(circle at 20% 30%, var(--g2) 0 18%, transparent 19%) 0 0 / 160px 140px,
    radial-gradient(circle at 70% 70%, var(--g2) 0 14%, transparent 15%) 40px 60px / 190px 170px,
    var(--g1);
}

.unit-edge {
  position: absolute;
  top: -18px;
  left: calc(50% - 50vw);
  z-index: -1;
  width: 100vw;
  height: 64px;
  pointer-events: none;
}

/* Шапка юнита «прилипает» под верхней панелью, пока листаем его уроки */
.unit-sticky {
  position: sticky;
  top: 8px;
  z-index: 6;
  filter: drop-shadow(0 10px 12px rgba(60, 35, 10, 0.3));
}

/* Отступ сверху — место для подсказки «Начать» над первым узлом,
   иначе её перекрывает прилипшая шапка юнита */
.path {
  position: relative;
  margin-top: 30px;
}

.path__row {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 104px;
}

.path__row--open {
  z-index: 5;
}

.path__pop {
  position: absolute;
  top: calc(50% + 44px);
  left: 50%;
  z-index: 7;
  transform: translateX(-50%);
}

.path__mascot {
  position: absolute;
  z-index: 1;
  width: 120px;
  height: 120px;
  pointer-events: none;
}

/* Сцена шире колонки: на телефоне видна середина, на планшете — края */
.scene {
  position: absolute;
  top: -70px;
  left: 50%;
  width: 640px;
  margin-left: -320px;
  line-height: 0;
  pointer-events: none;
}

.scene :deep(svg) {
  display: block;
  overflow: visible;
}

.scene--back { z-index: 0; }
.scene--front { z-index: 3; }

/* ——— Конец раздела ——— */

.outro {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}

.outro::before {
  bottom: -40px;
}

.end,
.outro__footer {
  border: 2px solid var(--paper-line);
  border-radius: 22px;
  background: var(--paper);
  box-shadow: var(--paper-shadow);
}

.end {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  color: var(--paper-ink);
}

.end h3 {
  color: inherit;
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
}

.end__text {
  margin-top: 2px;
  color: var(--paper-muted);
}

.end__btn {
  min-height: 42px;
  margin-top: 10px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--leaf), var(--leaf-shade));
  color: #fff;
  font-weight: 800;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.outro__footer {
  padding: 0 12px 6px;
}
</style>
