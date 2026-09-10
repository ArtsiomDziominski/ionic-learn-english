<script setup lang="ts">
import WordsMatchCard from "@/components/words/match/WordsMatchCard.vue";
import {wordsStore} from "@/store/words";
import {storeToRefs} from "pinia";
import {computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, UnwrapRef, watch} from "vue";
import {settingsStore} from "@/store/settings";

const storeWords = wordsStore();
const {cards} = storeToRefs(storeWords);

const storeSettings = settingsStore();

const selected: Ref<UnwrapRef<string[][]>> = ref([]);
const selectedErrorWord: Ref<UnwrapRef<string>> = ref('');
const selectedErrorWordTimeout: Ref<UnwrapRef<NodeJS.Timeout | null>> = ref(null);

const wordsList = computed(() => cards.value.map((w) => w.word).sort(() => Math.random() - 0.5));
const translationsList = computed(() => cards.value.map((t) => t.translation).sort(() => Math.random() - 0.5));

const selectWord = (word: string): void => {
  storeSettings.speakText(word);
  setWordList(word);
}

const selectTranslation = (translation: string): void => {
  setWordList(translation);
}

const selectedLastElements = computed((): string[] | undefined => {
  return selected.value.at(-1);
})

const setWordList = (value: string): void => {
  selectedErrorWord.value = '';
  if (selectedLastElements.value?.length === 1 && selectedLastElements.value?.includes(value)) selected.value.pop();
  else if (selected.value.some((s) => s.includes(value))) return;
  else if (selected.value.every((s) => s.length === 2)) selected.value.push([value]);
  else {
    const lastSelectedWord = selectedLastElements.value?.[0] || '';
    const word = cards.value.find((w => w.word === lastSelectedWord));
    const translation = cards.value.find((w => w.translation === lastSelectedWord));
    actionsSelectedList(word, translation, value);
  }
  nextWord();
}

const actionsSelectedList = (word: COMMON.Word | undefined, translation: COMMON.Word | undefined, value: string): void => {
  if (selectedErrorWordTimeout.value) clearTimeout(selectedErrorWordTimeout.value);
  const selectedLastElements = selected.value.at(-1);
  if (word && word?.translation === value) selectedLastElements?.push(value);
  else if (translation && translation?.word === value) selectedLastElements?.push(value);
  else if (
      (/[А-Яа-яЁё]/.test(selectedLastElements?.[0] || '') && /[А-Яа-яЁё]/.test(value)) ||
      (!/[А-Яа-яЁё]/.test(selectedLastElements?.[0] || '') && !/[А-Яа-яЁё]/.test(value))
  ) {
    selected.value.pop();
    selected.value.push([value]);
  } else {
    selectedErrorWord.value = value;
    selectedErrorWordTimeout.value = setTimeout(() => selectedErrorWord.value = '', 3000);
  }
}

const getColorCard = (word: string): string => {
  if (selected.value.some((s) => s.length === 2 && s.includes(word))) return 'success';
  else if (selected.value.some((s) => s.includes(word))) return 'primary';
  else if (selectedErrorWord.value === word) return 'danger';
  else return '';
}

const nextWord = (): void => {
  if (selected.value.length === 4 && selected.value.at(-1)?.length === 2) {
    setTimeout(() => storeWords.setNextWord(), 3000);
    storeWords.setAnswer(null, true);
  }
}

/* ——— Соединительные линии между найденными парами ————————— */

type Link = { key: string; x1: number; y1: number; x2: number; y2: number };

const matchRef = ref<HTMLElement | null>(null);
const cardElements = new Map<string, HTMLElement>();
const links: Ref<UnwrapRef<Link[]>> = ref([]);

const setCardRef = (component: any, key: string): void => {
  const element = component?.$el as HTMLElement | undefined;
  if (element) cardElements.set(key, element);
  else cardElements.delete(key);
};

const updateLinks = async (): Promise<void> => {
  await nextTick();
  const box = matchRef.value?.getBoundingClientRect();
  if (!box) {
    links.value = [];
    return;
  }

  const next: Link[] = [];
  for (const pair of selected.value) {
    if (pair.length !== 2) continue;
    const first = cardElements.get(pair[0]);
    const second = cardElements.get(pair[1]);
    if (!first || !second) continue;

    /* Соединяем обращённые друг к другу края карточек, а не центры:
       линия не заходит на текст. */
    const a = first.getBoundingClientRect();
    const b = second.getBoundingClientRect();
    const [left, right] = a.left <= b.left ? [a, b] : [b, a];

    next.push({
      key: pair.join('→'),
      x1: left.right - box.left,
      y1: left.top + left.height / 2 - box.top,
      x2: right.left - box.left,
      y2: right.top + right.height / 2 - box.top,
    });
  }
  links.value = next;
};

watch(selected, updateLinks, { deep: true });
watch([wordsList, translationsList], () => {
  cardElements.clear();
  updateLinks();
});

/* Линии строятся по фактическим координатам карточек, поэтому их
   нужно пересчитывать при любом изменении раскладки: анимация
   перехода между экранами, поворот устройства, подгрузка шрифта.
   Без этого линия может остаться там, где карточки были раньше. */
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateLinks();
  if (matchRef.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => updateLinks());
    resizeObserver.observe(matchRef.value);
  }
  window.addEventListener('resize', updateLinks);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updateLinks);
  if (selectedErrorWordTimeout.value) clearTimeout(selectedErrorWordTimeout.value);
});
</script>

<template>
  <div ref="matchRef" class="match">
    <div class="match__column">
      <WordsMatchCard
          v-for="word in wordsList"
          :key="word"
          :ref="(el: any) => setCardRef(el, word)"
          :class="word === selectedErrorWord ? 'match__error' : ''"
          :word="word"
          :color="getColorCard(word)"
          @click="selectWord(word)"
      />
    </div>

    <div class="match__column">
      <WordsMatchCard
          v-for="translation in translationsList"
          :key="translation"
          :ref="(el: any) => setCardRef(el, translation)"
          :class="translation === selectedErrorWord ? 'match__error' : ''"
          :word="translation"
          :color="getColorCard(translation)"
          @click="selectTranslation(translation)"
      />
    </div>

    <svg class="match__links" aria-hidden="true">
      <line
          v-for="link in links"
          :key="link.key"
          :x1="link.x1"
          :y1="link.y1"
          :x2="link.x2"
          :y2="link.y2"
          path-length="1"
      />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.match {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: start;
  gap: var(--app-sp-3);

  /* Карточки лежат внутри колонок, поэтому вертикальный зазор
     задаёт сама колонка: gap сетки разводит только столбцы. */
  &__column {
    display: flex;
    flex-direction: column;
    gap: var(--app-sp-3);
  }

  &__links {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;

    line {
      stroke: var(--ion-color-success);
      stroke-width: 2;
      stroke-linecap: round;
      /* pathLength="1" делает длину линии единичной, поэтому одна
         анимация подходит для любой длины */
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      animation: linkDraw var(--app-dur-slow) var(--app-ease) forwards;
    }
  }

  &__error {
    animation: shake 0.4s ease forwards;
  }
}

@keyframes linkDraw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes shake {
  0% {
    transform: translateX(-10px);
  }
  25% {
    transform: translateX(10px);
  }
  50% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
  100% {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .match__links line {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
