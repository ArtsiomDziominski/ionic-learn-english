import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  LESSON_BY_ID, UNIT_BY_ID, SECTION_BY_ID, WORD_BANK, getWord, type BankWord,
} from '@/core/course';
import {
  buildLearnLesson, buildPractice, buildReviewLesson, retryOf, shuffle,
  type BuildOptions, type Exercise, type PracticeMode,
} from '@/core/lessonBuilder';
import { useProgressStore, type LessonAnswer, type LessonRewards, type LessonSource } from './progress';
import { useSpeech } from '@/composables/useSpeech';
import { trackEvent } from '@/utils/analytics';

export type LessonPhase = 'answering' | 'correct' | 'wrong' | 'finished';

export interface CheckResult {
  correct: boolean;
  /** Засчитано с опечаткой — показываем правильное написание. */
  typo?: boolean;
  /** Правильный ответ для панели «Неверно». */
  answer?: string;
}

export const PRACTICE_META: Record<PracticeMode, { title: string; minWords: number }> = {
  mistakes: { title: 'Работа над ошибками', minWords: 3 },
  review: { title: 'Повторение', minWords: 4 },
  listening: { title: 'Аудирование', minWords: 4 },
  spelling: { title: 'Правописание', minWords: 4 },
  favorites: { title: 'Избранное', minWords: 4 },
  quick: { title: 'Быстрая тренировка', minWords: 4 },
};

const words = (ids: string[]): BankWord[] => ids.map((id) => WORD_BANK.get(id)).filter((w): w is BankWord => !!w);

/** Что за урок — для событий аналитики: урок пути или тренировка. */
const lessonParams = (src: LessonSource) =>
  src.kind === 'path'
    ? { lesson_type: 'path', lesson_id: src.lessonId }
    : { lesson_type: 'practice', mode: src.mode };

export const useLessonStore = defineStore('lesson', () => {
  const progress = useProgressStore();
  const { canListen } = useSpeech();

  const source = ref<LessonSource | null>(null);
  const title = ref('');
  const queue = ref<Exercise[]>([]);
  const position = ref(0);
  const total = ref(0);
  const doneKeys = ref<Set<string>>(new Set());
  const phase = ref<LessonPhase>('answering');
  const result = ref<CheckResult | null>(null);
  const mistakes = ref(0);
  const graded = ref(0);
  const combo = ref(0);
  const maxCombo = ref(0);
  const answers = ref<LessonAnswer[]>([]);
  const introduced = ref<string[]>([]);
  const startedAt = ref(0);
  const rewards = ref<LessonRewards | null>(null);
  /** id исходного задания для повторов — чтобы шкала не росла на ошибках. */
  const origin = new Map<string, string>();
  let buildOptions: BuildOptions = { listening: false, pool: [] };

  const current = computed<Exercise | null>(() => queue.value[position.value] ?? null);
  const ratio = computed(() => (total.value ? doneKeys.value.size / total.value : 0));
  const isPractice = computed(() => source.value?.kind === 'practice');
  const active = computed(() => source.value !== null && phase.value !== 'finished');
  /** Комбо показываем от трёх верных подряд. */
  const showCombo = computed(() => combo.value >= 3);

  function reset(): void {
    source.value = null;
    title.value = '';
    queue.value = [];
    position.value = 0;
    total.value = 0;
    doneKeys.value = new Set();
    phase.value = 'answering';
    result.value = null;
    mistakes.value = 0;
    graded.value = 0;
    combo.value = 0;
    maxCombo.value = 0;
    answers.value = [];
    introduced.value = [];
    rewards.value = null;
    origin.clear();
  }

  function begin(src: LessonSource, name: string, steps: Exercise[]): boolean {
    if (!steps.length) return false;
    reset();
    source.value = src;
    title.value = name;
    queue.value = steps;
    total.value = steps.length;
    startedAt.value = Date.now();
    steps.forEach((s) => origin.set(s.key, s.key));
    trackEvent('lesson_start', lessonParams(src));
    return true;
  }

  /** Пул для неверных вариантов: слова раздела плюс уже выученные. */
  function poolFor(sectionWords: string[]): BankWord[] {
    const ids = new Set([...sectionWords, ...progress.learnedIds.slice(0, 400)]);
    return words([...ids]);
  }

  function startPathLesson(lessonId: string): boolean {
    const lesson = LESSON_BY_ID.get(lessonId);
    if (!lesson) return false;
    const unit = UNIT_BY_ID.get(lesson.unitId);
    const section = SECTION_BY_ID.get(lesson.sectionId);
    buildOptions = { listening: canListen.value, pool: poolFor([...(unit?.words ?? []), ...(section?.words ?? [])]) };

    let steps: Exercise[];
    if (lesson.kind === 'review') {
      steps = buildReviewLesson(words(lesson.words), buildOptions);
    } else {
      // Для повтора берём знакомые слова, которые пора повторить, иначе случайные выученные
      const lessonSet = new Set(lesson.words);
      const due = progress.dueIds.filter((id) => !lessonSet.has(id));
      const others = shuffle(progress.learnedIds.filter((id) => !lessonSet.has(id)));
      const review = words([...due, ...others].slice(0, 2));
      steps = buildLearnLesson(words(lesson.words), review, (id) => progress.learnedSet.has(id), buildOptions);
    }
    const name = lesson.kind === 'review' ? `${unit?.title ?? 'Юнит'}: повторение` : `Урок ${lesson.index + 1}`;
    return begin({ kind: 'path', lessonId }, name, steps);
  }

  /** Слова для тренировки; null — их пока недостаточно. */
  function practiceWords(mode: PracticeMode): string[] | null {
    const learned = progress.learnedIds;
    let ids: string[];
    switch (mode) {
      case 'mistakes':
        ids = progress.weakIds;
        break;
      case 'review': {
        const due = progress.dueIds;
        const rest = [...learned].sort((a, b) => progress.state.words[a].lastSeen.localeCompare(progress.state.words[b].lastSeen));
        ids = [...new Set([...due, ...rest])];
        break;
      }
      case 'favorites':
        ids = shuffle(progress.state.favorites.filter((id) => WORD_BANK.has(id)));
        break;
      default:
        ids = shuffle(learned);
    }
    return ids.length >= PRACTICE_META[mode].minWords ? ids.slice(0, 8) : null;
  }

  function startPractice(mode: PracticeMode): boolean {
    const ids = practiceWords(mode);
    if (!ids) return false;
    if (mode === 'listening' && !canListen.value) return false;
    buildOptions = { listening: canListen.value, pool: poolFor(progress.currentSection.words) };
    const steps = buildPractice(mode, words(ids), buildOptions);
    return begin({ kind: 'practice', mode }, PRACTICE_META[mode].title, steps);
  }

  /** «Понятно» на карточке нового слова. */
  function acknowledgeIntro(): void {
    const ex = current.value;
    if (!ex || ex.type !== 'intro') return;
    if (!introduced.value.includes(ex.wordId)) introduced.value.push(ex.wordId);
    markDone(ex);
    advance();
  }

  function markDone(ex: Exercise): void {
    const key = origin.get(ex.key) ?? ex.key;
    if (!doneKeys.value.has(key)) {
      const next = new Set(doneKeys.value);
      next.add(key);
      doneKeys.value = next;
    }
  }

  /** Ответ проверен (кнопка «Проверить» или завершённое сопоставление). */
  function submit(check: CheckResult): void {
    const ex = current.value;
    if (!ex || phase.value !== 'answering') return;
    result.value = check;
    graded.value += 1;

    const ids = ex.type === 'match' ? ex.pairIds ?? [ex.wordId] : [ex.wordId];
    for (const wordId of ids) answers.value.push({ wordId, correct: check.correct, type: ex.type });
    trackEvent('answer', { exercise: ex.type, correct: check.correct });

    if (check.correct) {
      combo.value += 1;
      maxCombo.value = Math.max(maxCombo.value, combo.value);
      markDone(ex);
      phase.value = 'correct';
      return;
    }

    mistakes.value += 1;
    combo.value = 0;
    phase.value = 'wrong';
    // Ошибку исправляем в конце урока — свежими вариантами
    const retry = retryOf(ex, getWord(ex.wordId), buildOptions);
    origin.set(retry.key, origin.get(ex.key) ?? ex.key);
    queue.value = [...queue.value, retry];
    if (!isPractice.value) progress.spendHeart();
  }

  /** Жизни кончились — урок нельзя продолжить без пополнения. */
  const outOfHearts = computed(() => !isPractice.value && progress.heartsEnabled && progress.hearts <= 0);

  /** «Продолжить» после проверки. */
  function proceed(): void {
    if (phase.value !== 'correct' && phase.value !== 'wrong') return;
    advance();
  }

  function advance(): void {
    result.value = null;
    const next = position.value + 1;
    if (next >= queue.value.length) {
      finish();
      return;
    }
    position.value = next;
    phase.value = 'answering';
  }

  function finish(): void {
    if (!source.value) return;
    rewards.value = progress.finishLesson({
      source: source.value,
      answers: answers.value,
      introduced: introduced.value,
      mistakes: mistakes.value,
      graded: graded.value,
      maxCombo: maxCombo.value,
      durationMs: Date.now() - startedAt.value,
    });
    phase.value = 'finished';

    const r = rewards.value;
    trackEvent('lesson_complete', {
      ...lessonParams(source.value),
      xp: r.xp,
      accuracy: r.accuracy,
      perfect: r.perfect,
      first_completion: r.firstCompletion,
      new_words: r.newWords,
      duration_s: Math.round(r.durationMs / 1000),
      streak: r.streak,
    });
    if (r.goalReached) trackEvent('daily_goal_reached', { xp_goal: progress.state.dailyGoal });
    for (const a of r.achievements) trackEvent('unlock_achievement', { achievement_id: a.id, tier: a.tier });
  }

  /**
   * Ушли из незаконченного урока. Сразу сбрасывает его, поэтому
   * повторный вызов (выход из шторки и уход с экрана) событие не дублирует.
   */
  function abandon(reason: 'quit' | 'out_of_hearts' | 'left'): void {
    if (!source.value || phase.value === 'finished') return;
    trackEvent('lesson_abandon', {
      ...lessonParams(source.value),
      progress: Math.round(ratio.value * 100),
      mistakes: mistakes.value,
      reason,
    });
    reset();
  }

  return {
    source,
    title,
    queue,
    position,
    total,
    phase,
    result,
    mistakes,
    combo,
    maxCombo,
    rewards,
    current,
    ratio,
    isPractice,
    active,
    showCombo,
    outOfHearts,
    practiceWords,
    startPathLesson,
    startPractice,
    acknowledgeIntro,
    submit,
    proceed,
    abandon,
    reset,
  };
});
