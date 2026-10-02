import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { dayKey, daysBetween } from '@/core/dates';
import {
  CHEST_IDS, LESSON_BY_ID, SECTIONS, WORD_BANK, getSection,
} from '@/core/course';
import {
  MAX_FREEZES, MAX_HEARTS, createProgress, gainHeart, heartsNow, loseHeart, nextHeartIn,
  mergeProgress, reconcileStreak, registerActiveDay, sanitizeProgress, settleHearts,
  type Progress,
} from '@/core/progress';
import { isWeak, learnWord, reviewWord } from '@/core/srs';
import { applyQuestEvent, generateDailyQuests, isQuestDone, questTitle } from '@/core/quests';
import { achievementViews, metricsOf, newlyEarned, tierReward, type AchievementIcon } from '@/core/achievements';
import { migrateLegacy } from '@/core/legacy';
import type { ExerciseType, PracticeMode } from '@/core/lessonBuilder';
import { getStorageItem, getStorageJSON } from '@/utils/util';
import { useSettingsStore } from './settings';
import { speechAvailable } from '@/composables/useSpeech';

const STORAGE_KEY = 'slovaday.progress.v1';

export const REFILL_COST = 100;
export const FREEZE_COST = 150;

export interface LessonAnswer {
  wordId: string;
  correct: boolean;
  type: ExerciseType;
}

export type LessonSource =
  | { kind: 'path'; lessonId: string }
  | { kind: 'practice'; mode: PracticeMode };

export interface LessonOutcome {
  source: LessonSource;
  answers: LessonAnswer[];
  introduced: string[];
  mistakes: number;
  graded: number;
  maxCombo: number;
  durationMs: number;
}

export interface EarnedAchievement {
  id: string;
  title: string;
  tier: number;
  reward: number;
  icon: AchievementIcon;
  color: string;
}

export interface LessonRewards {
  xp: number;
  gems: number;
  accuracy: number;
  perfect: boolean;
  firstCompletion: boolean;
  streakExtended: boolean;
  streak: number;
  goalReached: boolean;
  newWords: number;
  heartGained: boolean;
  achievements: EarnedAchievement[];
  questsCompleted: string[];
  durationMs: number;
}

export type StreakNotice = { kind: 'frozen'; days: number } | { kind: 'lost'; days: number } | null;

function loadProgress(): Progress {
  const raw = getStorageJSON<unknown>(STORAGE_KEY, null);
  if (raw) return sanitizeProgress(raw);
  return migrateLegacy((key) => getStorageItem(key)) ?? createProgress();
}

/** Сундук даёт 15–30 кристаллов; сумма зависит от id, чтобы не «перекатывать». */
const chestReward = (id: string): number => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 15 + (h % 4) * 5;
};

export const useProgressStore = defineStore('progress', () => {
  const settings = useSettingsStore();
  const state = ref<Progress>(loadProgress());
  const now = ref(Date.now());
  const today = computed(() => dayKey(new Date(now.value)));
  const streakNotice = ref<StreakNotice>(null);

  /* ——— Сохранение ——————————————————————————————————————— */

  let saveTimer: number | undefined;
  const saveNow = (): void => {
    window.clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
    } catch (error) {
      console.warn('Не удалось сохранить прогресс', error);
    }
  };
  watch(state, () => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 250);
  }, { deep: true });

  const touch = (): void => {
    state.value.updatedAt = new Date().toISOString();
  };

  /* ——— Производные ———————————————————————————————————————— */

  const heartsEnabled = computed(() => settings.settings.hearts);
  const hearts = computed(() => heartsNow(state.value.hearts, now.value));
  const nextHeartMs = computed(() => nextHeartIn(state.value.hearts, now.value));
  const xpToday = computed(() => state.value.xpByDay[today.value] ?? 0);
  const goalRatio = computed(() => Math.min(1, xpToday.value / Math.max(1, state.value.dailyGoal)));
  const activeToday = computed(() => state.value.streak.lastDay === today.value);
  /** Текущая серия: сгоревшая (пропущено больше дня) показывается нулём. */
  const streak = computed(() => {
    const s = state.value.streak;
    return s.lastDay && daysBetween(s.lastDay, today.value) <= 1 ? s.current : 0;
  });

  const learnedIds = computed(() => Object.keys(state.value.words).filter((id) => WORD_BANK.has(id)));
  const learnedSet = computed(() => new Set(learnedIds.value));
  const learnedCount = computed(() => learnedIds.value.length);
  const dueIds = computed(() =>
    learnedIds.value
      .filter((id) => state.value.words[id].due <= today.value)
      .sort((a, b) => state.value.words[a].due.localeCompare(state.value.words[b].due)));
  const weakIds = computed(() =>
    learnedIds.value
      .filter((id) => isWeak(state.value.words[id]))
      .sort((a, b) => state.value.words[b].wrong - state.value.words[a].wrong));
  const favoritesSet = computed(() => new Set(state.value.favorites));

  const isLessonDone = (id: string): boolean => id in state.value.lessons;
  const isChestOpen = (id: string): boolean => state.value.chests.includes(id);

  const currentSection = computed(() => getSection(state.value.sectionId));

  const unitsCompleted = computed(() =>
    SECTIONS.reduce((sum, s) => sum + s.units.filter((u) => isLessonDone(`${u.id}-review`)).length, 0));

  const achievements = computed(() => achievementViews(metricsOf(state.value, unitsCompleted.value)));

  const quests = computed(() => (state.value.quests.day === today.value ? state.value.quests.list : []));

  const lessonsDone = computed(() => Object.keys(state.value.lessons).length);

  /* ——— Жизненный цикл ————————————————————————————————————— */

  const ensureQuests = (): void => {
    if (state.value.quests.day !== today.value) {
      state.value.quests = { day: today.value, list: generateDailyQuests(today.value, speechAvailable.value) };
    }
  };

  const reconcile = (): void => {
    const r = reconcileStreak(state.value.streak, today.value);
    if (r.usedFreezes) {
      state.value.streak = r.streak;
      streakNotice.value = { kind: 'frozen', days: r.usedFreezes };
      touch();
    } else if (r.lost) {
      streakNotice.value = { kind: 'lost', days: state.value.streak.current };
      state.value.streak = r.streak;
      touch();
    }
  };

  let ticker: number | undefined;
  const init = (): void => {
    reconcile();
    ensureQuests();
    window.clearInterval(ticker);
    ticker = window.setInterval(() => {
      now.value = Date.now();
    }, 15_000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveNow();
      else now.value = Date.now();
    });
    window.addEventListener('pagehide', saveNow);
  };

  // Наступил новый день, пока приложение открыто
  watch(today, () => {
    reconcile();
    ensureQuests();
  });

  /* ——— Урок ————————————————————————————————————————————————— */

  function finishLesson(outcome: LessonOutcome): LessonRewards {
    const p = state.value;
    const t = today.value;
    const at = new Date();
    ensureQuests();

    const graded = Math.max(0, outcome.graded);
    const mistakes = Math.min(graded, Math.max(0, outcome.mistakes));
    const accuracy = graded ? Math.round(((graded - mistakes) / graded) * 100) : 100;
    const perfect = mistakes === 0;

    let xp: number;
    let gems: number;
    let firstCompletion = false;
    let isPath = false;
    let heartGained = false;

    if (outcome.source.kind === 'path') {
      isPath = true;
      const id = outcome.source.lessonId;
      const lesson = LESSON_BY_ID.get(id);
      const record = p.lessons[id];
      const isReview = lesson?.kind === 'review';
      firstCompletion = !record;
      xp = firstCompletion ? (isReview ? 20 : 10) : 5;
      if (perfect) xp += firstCompletion ? 5 : 2;
      gems = firstCompletion ? (isReview ? 20 : 5) : 1;
      p.lessons[id] = record
        ? { ...record, times: record.times + 1, bestAccuracy: Math.max(record.bestAccuracy, accuracy) }
        : { completedAt: t, times: 1, bestAccuracy: accuracy };
      p.stats.lessons += 1;
    } else {
      xp = 8 + (perfect ? 2 : 0);
      gems = 3;
      p.stats.practice += 1;
      // Как в Duolingo: тренировка возвращает жизнь
      if (heartsEnabled.value && heartsNow(p.hearts, Date.now()) < MAX_HEARTS) {
        p.hearts = gainHeart(p.hearts, Date.now());
        heartGained = true;
      }
    }
    xp += Math.min(5, Math.floor(outcome.maxCombo / 5));

    // Слова: новые выучены, по каждому ответу — шаг повторения
    let newWords = 0;
    for (const id of outcome.introduced) {
      if (WORD_BANK.has(id) && !p.words[id]) {
        p.words[id] = learnWord(t);
        newWords++;
      }
    }
    for (const a of outcome.answers) {
      if (!WORD_BANK.has(a.wordId) || !p.words[a.wordId]) continue;
      p.words[a.wordId] = reviewWord(p.words[a.wordId], a.correct, t);
    }

    const xpBefore = p.xpByDay[t] ?? 0;
    p.xpByDay[t] = xpBefore + xp;
    p.xpTotal += xp;
    const goalReached = xpBefore < p.dailyGoal && xpBefore + xp >= p.dailyGoal;

    const streakResult = registerActiveDay(p.streak, t);
    p.streak = streakResult.streak;
    p.gems += gems;

    const hour = at.getHours();
    p.stats.answers += graded;
    p.stats.correct += graded - mistakes;
    p.stats.bestCombo = Math.max(p.stats.bestCombo, outcome.maxCombo);
    if (perfect && graded > 0) p.stats.perfectLessons += 1;
    const listenCorrect = outcome.answers.filter((a) => a.type === 'listen' && a.correct).length;
    p.stats.listenCorrect += listenCorrect;
    p.stats.timeMs += Math.max(0, Math.min(outcome.durationMs, 3_600_000));
    p.stats.bestDayXp = Math.max(p.stats.bestDayXp, p.xpByDay[t]);
    if (hour < 8) p.stats.earlyLessons += 1;
    if (hour >= 22) p.stats.lateLessons += 1;

    // Задания дня
    const doneBefore = new Set(p.quests.list.filter(isQuestDone).map((q) => q.id));
    p.quests.list = applyQuestEvent(p.quests.list, {
      xp,
      lessons: isPath ? 1 : 0,
      bestCombo: outcome.maxCombo,
      perfect: perfect && graded > 0 ? 1 : 0,
      newWords,
      practice: isPath ? 0 : 1,
      listenCorrect,
    });
    const questsCompleted = p.quests.list.filter((q) => isQuestDone(q) && !doneBefore.has(q.id)).map(questTitle);

    // Достижения: каждый новый уровень приносит кристаллы
    const earned: EarnedAchievement[] = [];
    for (const { view, tier } of newlyEarned(achievementViews(metricsOf(p, unitsCompleted.value)), p.achievements)) {
      p.achievements[view.def.id] = tier;
      const reward = tierReward(tier);
      p.gems += reward;
      earned.push({ id: view.def.id, title: view.def.title, tier, reward, icon: view.def.icon, color: view.def.color });
    }

    now.value = Date.now();
    touch();

    return {
      xp,
      gems,
      accuracy,
      perfect,
      firstCompletion,
      streakExtended: streakResult.extended,
      streak: p.streak.current,
      goalReached,
      newWords,
      heartGained,
      achievements: earned,
      questsCompleted,
      durationMs: outcome.durationMs,
    };
  }

  /* ——— Жизни, магазин, награды ————————————————————————————— */

  const spendHeart = (): void => {
    if (!heartsEnabled.value) return;
    state.value.hearts = loseHeart(state.value.hearts, Date.now());
    now.value = Date.now();
    touch();
  };

  const refillHearts = (): boolean => {
    if (state.value.gems < REFILL_COST || hearts.value >= MAX_HEARTS) return false;
    state.value.gems -= REFILL_COST;
    state.value.hearts = { count: MAX_HEARTS, updatedAt: Date.now() };
    touch();
    return true;
  };

  const buyFreeze = (): boolean => {
    if (state.value.gems < FREEZE_COST || state.value.streak.freezes >= MAX_FREEZES) return false;
    state.value.gems -= FREEZE_COST;
    state.value.streak = { ...state.value.streak, freezes: state.value.streak.freezes + 1 };
    touch();
    return true;
  };

  const openChest = (id: string): number => {
    if (!CHEST_IDS.has(id) || isChestOpen(id)) return 0;
    const amount = chestReward(id);
    state.value.chests.push(id);
    state.value.gems += amount;
    touch();
    return amount;
  };

  const claimQuest = (id: string): number => {
    const quest = state.value.quests.list.find((q) => q.id === id);
    if (!quest || quest.claimed || !isQuestDone(quest)) return 0;
    quest.claimed = true;
    state.value.gems += quest.reward;
    touch();
    return quest.reward;
  };

  /* ——— Профиль и словарь —————————————————————————————————— */

  const toggleFavorite = (id: string): boolean => {
    if (!WORD_BANK.has(id)) return false;
    const list = state.value.favorites;
    const index = list.indexOf(id);
    if (index >= 0) list.splice(index, 1);
    else list.push(id);
    touch();
    return index < 0;
  };

  const setName = (name: string): void => {
    const clean = name.trim().slice(0, 40);
    if (clean) state.value.profile.name = clean;
    touch();
  };

  const setAvatar = (dataUrl: string | null): void => {
    state.value.profile.avatar = dataUrl;
    touch();
  };

  const setDailyGoal = (goal: number): void => {
    state.value.dailyGoal = goal;
    touch();
  };

  const setSection = (id: string): void => {
    state.value.sectionId = getSection(id).id;
    touch();
  };

  const completeOnboarding = (opts: { goal: number; sectionId: string }): void => {
    state.value.dailyGoal = opts.goal;
    state.value.sectionId = getSection(opts.sectionId).id;
    state.value.onboarded = true;
    touch();
  };

  /* ——— Перенос ——————————————————————————————————————————————— */

  const snapshot = (): Progress => {
    // Жизни фиксируются перед экспортом, чтобы таймер не «перескочил»
    const copy = JSON.parse(JSON.stringify(state.value)) as Progress;
    copy.hearts = settleHearts(copy.hearts, Date.now());
    return copy;
  };

  const replaceWith = (incoming: Progress): void => {
    state.value = { ...incoming, onboarded: true };
    streakNotice.value = null;
    reconcile();
    ensureQuests();
    touch();
    saveNow();
  };

  const mergeWith = (incoming: Progress): void => {
    state.value = mergeProgress(state.value, incoming);
    reconcile();
    ensureQuests();
    touch();
    saveNow();
  };

  const resetAll = (): void => {
    state.value = createProgress();
    streakNotice.value = null;
    ensureQuests();
    saveNow();
  };

  return {
    state,
    now,
    today,
    streakNotice,
    heartsEnabled,
    hearts,
    nextHeartMs,
    xpToday,
    goalRatio,
    activeToday,
    streak,
    learnedIds,
    learnedSet,
    learnedCount,
    dueIds,
    weakIds,
    favoritesSet,
    currentSection,
    unitsCompleted,
    achievements,
    quests,
    lessonsDone,
    isLessonDone,
    isChestOpen,
    init,
    finishLesson,
    spendHeart,
    refillHearts,
    buyFreeze,
    openChest,
    claimQuest,
    toggleFavorite,
    setName,
    setAvatar,
    setDailyGoal,
    setSection,
    completeOnboarding,
    snapshot,
    replaceWith,
    mergeWith,
    resetAll,
    saveNow,
  };
});

export { MAX_HEARTS, MAX_FREEZES };
