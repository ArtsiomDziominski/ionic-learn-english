<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IonContent, IonHeader, IonPage } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { ALL_WORD_IDS, SECTIONS, TOTAL_WORDS, getWord, type BankWord } from '@/core/course';
import { isWeak, strengthBars } from '@/core/srs';
import { normalizeAnswer } from '@/core/answers';
import { plural } from '@/core/dates';
import { useProgressStore } from '@/store/progress';
import { useSpeech } from '@/composables/useSpeech';
import { useSound } from '@/composables/useSound';
import { hapticTap } from '@/composables/useHaptics';
import { useSEO } from '@/composables/useSEO';
import PageTopBar from '@/components/PageTopBar.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import GameIcon from '@/components/ui/GameIcon.vue';

type Filter = 'all' | 'learned' | 'favorites' | 'weak' | 'new';

const progress = useProgressStore();
const { speak, available } = useSpeech();
const { play } = useSound();
const { learnedCount, learnedSet, favoritesSet, state, today } = storeToRefs(progress);

const query = ref('');
const filter = ref<Filter>('all');
const limit = ref(60);
const sentinel = ref<HTMLElement | null>(null);

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'learned', label: 'Изученные' },
  { id: 'favorites', label: 'Избранные' },
  { id: 'weak', label: 'Сложные' },
  { id: 'new', label: 'Новые' },
];

/* ——— Прогресс по разделам ———————————————————————————————— */

const ratio = computed(() => learnedCount.value / TOTAL_WORDS);
const sections = computed(() =>
  SECTIONS.map((s) => {
    const done = s.words.filter((id) => learnedSet.value.has(id)).length;
    return { id: s.id, badge: s.kind === 'topics' ? 'Темы' : s.badge, done, total: s.words.length };
  }));

/* ——— Список ——————————————————————————————————————————————— */

const levelOf = (w: BankWord): string => w.tags.find((t) => /^[ABC][12]$/.test(t)) ?? 'Тема';

const filtered = computed(() => {
  const q = normalizeAnswer(query.value);
  return ALL_WORD_IDS.filter((id) => {
    const learned = learnedSet.value.has(id);
    switch (filter.value) {
      case 'learned': if (!learned) return false; break;
      case 'favorites': if (!favoritesSet.value.has(id)) return false; break;
      case 'weak': if (!learned || !isWeak(state.value.words[id])) return false; break;
      case 'new': if (learned) return false; break;
    }
    if (!q) return true;
    const w = getWord(id);
    return !!w && (normalizeAnswer(w.word).includes(q) || w.translations.some((t) => normalizeAnswer(t).includes(q)));
  });
});

const visible = computed(() => filtered.value.slice(0, limit.value).map((id) => getWord(id) as BankWord));

watch([query, filter], () => {
  limit.value = 60;
});

const toggleFavorite = (id: string): void => {
  const added = progress.toggleFavorite(id);
  play('tap');
  hapticTap();
  if (added) play('match');
};

/* Подгрузка по мере прокрутки: 1100 строк сразу тяжело для телефона */
let observer: IntersectionObserver | null = null;
onMounted(() => {
  useSEO({
    title: 'Мой словарь английских слов | learnenglisheasy.ru',
    description: 'Ваш персональный словарь для изучения английского языка. Отслеживайте прогресс, повторяйте слова и расширяйте свой словарный запас эффективно.',
    keywords: 'словарь английского, мой словарь, изученные слова, английский словарь, vocabulary list',
    url: 'https://www.learnenglisheasy.ru/vocabulary',
  });
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && limit.value < filtered.value.length) limit.value += 60;
  }, { rootMargin: '400px' });
  if (sentinel.value) observer.observe(sentinel.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <ion-page>
    <ion-header class="header">
      <PageTopBar title="Словарь" />
    </ion-header>

    <ion-content>
      <div class="page stack">
        <!-- Прогресс изученных слов -->
        <section class="progress card">
          <div class="progress__head">
            <GameIcon name="book" :size="44" />
            <div class="grow">
              <p class="progress__value nums">{{ learnedCount }} <span>из {{ TOTAL_WORDS }}</span></p>
              <p class="muted">{{ plural(learnedCount, 'слово изучено', 'слова изучено', 'слов изучено') }}</p>
            </div>
            <p class="progress__pct nums">{{ Math.round(ratio * 100) }}%</p>
          </div>
          <ProgressBar :value="ratio" :height="20" color="var(--violet)" label="Изучено слов" />
          <div class="levels">
            <div v-for="s in sections" :key="s.id" class="level">
              <span class="level__badge">{{ s.badge }}</span>
              <ProgressBar :value="s.total ? s.done / s.total : 0" :height="10" :shine="false" color="var(--green)" />
              <span class="level__count nums">{{ s.done }}/{{ s.total }}</span>
            </div>
          </div>
        </section>

        <label class="sr-only" for="vocab-search">Поиск слова</label>
        <input id="vocab-search" v-model="query" class="field" type="search" placeholder="Найти слово или перевод" autocomplete="off" />

        <div class="chips" role="tablist" aria-label="Фильтр слов">
          <button
            v-for="f in FILTERS"
            :key="f.id"
            type="button"
            role="tab"
            :aria-selected="filter === f.id"
            class="chip"
            :class="{ 'chip--active': filter === f.id }"
            @click="filter = f.id"
          >
            {{ f.label }}
          </button>
        </div>

        <p class="count muted">{{ filtered.length }} {{ plural(filtered.length, 'слово', 'слова', 'слов') }}</p>

        <ul v-if="visible.length" class="words">
          <li v-for="w in visible" :key="w.id" class="word">
            <button v-if="available" type="button" class="word__say" :aria-label="`Произнести ${w.word}`" @click="speak(w.word)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.2v5.6h3.8l4.9 4V5.2l-4.9 4z" fill="currentColor" /><path d="M15.5 8.6a4.8 4.8 0 0 1 0 6.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" /></svg>
            </button>
            <div class="grow">
              <p class="word__en" lang="en">{{ w.word }}</p>
              <p class="word__ru">{{ w.translations.join(', ') }}</p>
            </div>
            <div class="word__meta">
              <span class="word__level">{{ levelOf(w) }}</span>
              <span v-if="learnedSet.has(w.id)" class="bars" :aria-label="`Сила запоминания ${strengthBars(state.words[w.id], today)} из 4`">
                <i v-for="n in 4" :key="n" :class="{ on: n <= strengthBars(state.words[w.id], today) }" />
              </span>
            </div>
            <button
              type="button"
              class="word__fav"
              :class="{ 'word__fav--on': favoritesSet.has(w.id) }"
              :aria-pressed="favoritesSet.has(w.id)"
              :aria-label="favoritesSet.has(w.id) ? 'Убрать из избранного' : 'В избранное'"
              @click="toggleFavorite(w.id)"
            >
              <GameIcon name="heart" :size="26" :muted="!favoritesSet.has(w.id)" />
            </button>
          </li>
        </ul>
        <p v-else class="empty muted">Ничего не нашлось. Попробуйте другой запрос или фильтр.</p>
        <div ref="sentinel" aria-hidden="true" />
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.header {
  background: var(--bg);
  border-bottom: 2px solid var(--line);
  padding-top: env(safe-area-inset-top);
}

.progress {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.progress__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress__value {
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1.1;
}

.progress__value span {
  color: var(--text-subtle);
  font-size: 1rem;
}

.progress__pct {
  color: var(--violet-ink);
  font-size: 1.4rem;
  font-weight: 900;
}

.levels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
}

.level {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level__badge {
  min-width: 40px;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 900;
}

.level__count {
  min-width: 52px;
  color: var(--text-subtle);
  font-size: 0.78rem;
  font-weight: 800;
  text-align: right;
}

.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.chips .chip {
  flex-shrink: 0;
  cursor: pointer;
}

.count { font-size: 0.88rem; }

.words {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  border: 2px solid var(--line);
  border-radius: var(--r-xl);
  list-style: none;
  overflow: hidden;
}

.word {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 2px solid var(--line);
  background: var(--surface);
}

.word:last-child { border-bottom: none; }

.word__say {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--r-md);
  background: var(--blue-soft);
  color: var(--blue);
  cursor: pointer;
}

.word__say svg { width: 22px; height: 22px; }

.word__en {
  font-size: 1.05rem;
  font-weight: 900;
  word-break: break-word;
}

.word__ru {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.word__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.word__level {
  padding: 2px 8px;
  border-radius: var(--r-pill);
  background: var(--violet-soft);
  color: var(--violet-ink);
  font-size: 0.72rem;
  font-weight: 900;
}

.bars {
  display: flex;
  gap: 2px;
}

.bars i {
  width: 6px;
  height: 12px;
  border-radius: 2px;
  background: var(--surface-3);
}

.bars i.on { background: var(--green); }

.word__fav {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: var(--r-md);
  background: transparent;
  cursor: pointer;
}

.word__fav:active .game-icon { transform: scale(0.85); }
.word__fav--on .game-icon { animation: pop 300ms var(--spring); }

.empty {
  padding: 24px 0;
  text-align: center;
}
</style>
