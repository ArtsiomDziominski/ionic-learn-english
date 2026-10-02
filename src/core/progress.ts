/**
 * Прогресс ученика — единый документ, который хранится в
 * localStorage, экспортируется в файл и импортируется обратно.
 *
 * Всё здесь — чистые функции без Vue и браузерных API:
 * их легко проверить и безопасно вызывать на данных из файла.
 * Данные из файла считаются недоверенными: sanitizeProgress
 * приводит их к схеме, отбрасывая всё лишнее и неизвестное.
 */
import { addDays, dayKey, daysBetween, isDayKey } from './dates';
import { CHEST_IDS, DEFAULT_SECTION_ID, LESSON_BY_ID, SECTION_BY_ID, WORD_BANK } from './course';

export const PROGRESS_SCHEMA = 'slova-day.progress';
export const PROGRESS_VERSION = 1;

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60_000;
export const MAX_FREEZES = 2;
export const START_GEMS = 50;
export const DAILY_GOALS = [10, 20, 30, 50] as const;
export const DEFAULT_DAILY_GOAL = 20;
export const DEFAULT_NAME = 'Ученик';

export interface WordProgress {
  /** День, когда слово выучено (ключ дня). */
  learnedAt: string;
  /** Сила запоминания 0–5 — ящик интервального повторения. */
  strength: number;
  /** Когда повторить (ключ дня). */
  due: string;
  seen: number;
  correct: number;
  wrong: number;
  lastSeen: string;
}

export interface LessonRecord {
  completedAt: string;
  times: number;
  bestAccuracy: number;
}

export interface QuestState {
  id: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
}

export interface ProgressStats {
  lessons: number;
  perfectLessons: number;
  practice: number;
  answers: number;
  correct: number;
  bestCombo: number;
  listenCorrect: number;
  timeMs: number;
  bestDayXp: number;
  earlyLessons: number;
  lateLessons: number;
}

export interface Progress {
  schema: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  onboarded: boolean;
  profile: {
    name: string;
    avatar: string | null;
    joinedAt: string;
  };
  sectionId: string;
  dailyGoal: number;
  xpByDay: Record<string, number>;
  xpTotal: number;
  streak: {
    current: number;
    best: number;
    lastDay: string | null;
    freezes: number;
    frozenDays: string[];
  };
  gems: number;
  hearts: {
    count: number;
    /** Момент, от которого считается восстановление (мс). */
    updatedAt: number;
  };
  lessons: Record<string, LessonRecord>;
  chests: string[];
  words: Record<string, WordProgress>;
  favorites: string[];
  quests: { day: string; list: QuestState[] };
  /** id достижения → сколько уровней уже выдано. */
  achievements: Record<string, number>;
  stats: ProgressStats;
}

export const emptyStats = (): ProgressStats => ({
  lessons: 0,
  perfectLessons: 0,
  practice: 0,
  answers: 0,
  correct: 0,
  bestCombo: 0,
  listenCorrect: 0,
  timeMs: 0,
  bestDayXp: 0,
  earlyLessons: 0,
  lateLessons: 0,
});

export function createProgress(now: Date = new Date()): Progress {
  const iso = now.toISOString();
  return {
    schema: PROGRESS_SCHEMA,
    version: PROGRESS_VERSION,
    createdAt: iso,
    updatedAt: iso,
    onboarded: false,
    profile: { name: DEFAULT_NAME, avatar: null, joinedAt: dayKey(now) },
    sectionId: DEFAULT_SECTION_ID,
    dailyGoal: DEFAULT_DAILY_GOAL,
    xpByDay: {},
    xpTotal: 0,
    streak: { current: 0, best: 0, lastDay: null, freezes: 0, frozenDays: [] },
    gems: START_GEMS,
    hearts: { count: MAX_HEARTS, updatedAt: now.getTime() },
    lessons: {},
    chests: [],
    words: {},
    favorites: [],
    quests: { day: '', list: [] },
    achievements: {},
    stats: emptyStats(),
  };
}

/* ——— Жизни ———————————————————————————————————————————————— */

/** Сколько жизней сейчас с учётом восстановления по времени. */
export function heartsNow(hearts: Progress['hearts'], now: number): number {
  if (hearts.count >= MAX_HEARTS) return MAX_HEARTS;
  const regen = Math.floor(Math.max(0, now - hearts.updatedAt) / HEART_REGEN_MS);
  return Math.min(MAX_HEARTS, hearts.count + regen);
}

/** Через сколько мс появится следующая жизнь; null — запас полный. */
export function nextHeartIn(hearts: Progress['hearts'], now: number): number | null {
  if (heartsNow(hearts, now) >= MAX_HEARTS) return null;
  const elapsed = Math.max(0, now - hearts.updatedAt) % HEART_REGEN_MS;
  return HEART_REGEN_MS - elapsed;
}

/** Фиксирует восстановленные жизни, сохраняя «остаток» таймера. */
export function settleHearts(hearts: Progress['hearts'], now: number): Progress['hearts'] {
  const count = heartsNow(hearts, now);
  if (count >= MAX_HEARTS) return { count: MAX_HEARTS, updatedAt: now };
  const regen = count - hearts.count;
  return { count, updatedAt: hearts.updatedAt + regen * HEART_REGEN_MS };
}

export function loseHeart(hearts: Progress['hearts'], now: number): Progress['hearts'] {
  const settled = settleHearts(hearts, now);
  // Таймер восстановления стартует с первой потерянной жизни
  const updatedAt = settled.count >= MAX_HEARTS ? now : settled.updatedAt;
  return { count: Math.max(0, settled.count - 1), updatedAt };
}

export function gainHeart(hearts: Progress['hearts'], now: number, amount = 1): Progress['hearts'] {
  const settled = settleHearts(hearts, now);
  const count = Math.min(MAX_HEARTS, settled.count + amount);
  return { count, updatedAt: count >= MAX_HEARTS ? now : settled.updatedAt };
}

/* ——— Серия ———————————————————————————————————————————————— */

/**
 * Вызывается при открытии приложения: если дни пропущены,
 * тратит заморозки, а если их не хватает — обнуляет серию.
 * Возвращает новую серию и сколько заморозок потрачено.
 */
export function reconcileStreak(streak: Progress['streak'], today: string): { streak: Progress['streak']; usedFreezes: number; lost: boolean } {
  if (!streak.lastDay || streak.current === 0) return { streak, usedFreezes: 0, lost: false };
  const gap = daysBetween(streak.lastDay, today);
  if (gap <= 1) return { streak, usedFreezes: 0, lost: false };

  const missed = gap - 1;
  if (streak.freezes >= missed) {
    const frozen = Array.from({ length: missed }, (_, i) => addDays(streak.lastDay as string, i + 1));
    return {
      streak: {
        ...streak,
        freezes: streak.freezes - missed,
        frozenDays: [...streak.frozenDays, ...frozen].slice(-60),
        lastDay: addDays(today, -1),
      },
      usedFreezes: missed,
      lost: false,
    };
  }
  return { streak: { ...streak, current: 0 }, usedFreezes: 0, lost: true };
}

/** Засчитывает активный день. extended — серия выросла именно сейчас. */
export function registerActiveDay(streak: Progress['streak'], today: string): { streak: Progress['streak']; extended: boolean } {
  if (streak.lastDay === today) return { streak, extended: false };
  const continues = streak.lastDay !== null && daysBetween(streak.lastDay, today) === 1 && streak.current > 0;
  const current = continues ? streak.current + 1 : 1;
  return {
    streak: { ...streak, current, best: Math.max(streak.best, current), lastDay: today },
    extended: true,
  };
}

/** Самая длинная серия по множеству активных дней (для импорта и миграции). */
export function longestRun(days: Iterable<string>): { best: number; endingAt: Map<string, number> } {
  const sorted = [...new Set(days)].filter(isDayKey).sort();
  const endingAt = new Map<string, number>();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev && daysBetween(prev, day) === 1 ? run + 1 : 1;
    endingAt.set(day, run);
    best = Math.max(best, run);
    prev = day;
  }
  return { best, endingAt };
}

/** Серия, восстановленная по активным дням: жива, если последний день — сегодня или вчера. */
export function streakFromDays(days: Iterable<string>, today: string): { current: number; best: number; lastDay: string | null } {
  const { best, endingAt } = longestRun(days);
  const sorted = [...endingAt.keys()].sort();
  const lastDay = sorted[sorted.length - 1] ?? null;
  if (!lastDay) return { current: 0, best: 0, lastDay: null };
  const alive = daysBetween(lastDay, today) <= 1;
  return { current: alive ? endingAt.get(lastDay) ?? 0 : 0, best, lastDay };
}

/* ——— Санитайзер ———————————————————————————————————————————— */

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};
const str = (v: unknown, fallback: string, maxLen = 200): string =>
  typeof v === 'string' ? v.slice(0, maxLen) : fallback;
const day = (v: unknown, fallback: string): string => (isDayKey(v) ? v : fallback);
const iso = (v: unknown, fallback: string): string =>
  typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : fallback;

/** Аватар — только data URL картинки разумного размера. */
const avatar = (v: unknown): string | null =>
  typeof v === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 600_000 ? v : null;

/**
 * Приводит произвольные данные к схеме Progress. Неизвестные слова,
 * уроки и сундуки отбрасываются, числа ограничиваются разумными
 * пределами — импортированный файл не может сломать приложение.
 */
export function sanitizeProgress(input: unknown, now: Date = new Date()): Progress {
  const base = createProgress(now);
  if (!isObj(input)) return base;
  const today = dayKey(now);

  const profile = isObj(input.profile) ? input.profile : {};
  const streak = isObj(input.streak) ? input.streak : {};
  const hearts = isObj(input.hearts) ? input.hearts : {};
  const stats = isObj(input.stats) ? input.stats : {};
  const quests = isObj(input.quests) ? input.quests : {};

  const xpByDay: Record<string, number> = {};
  if (isObj(input.xpByDay)) {
    for (const [k, v] of Object.entries(input.xpByDay)) {
      if (isDayKey(k)) {
        const n = num(v, 0, 0, 100_000);
        if (n > 0) xpByDay[k] = n;
      }
    }
  }
  const xpSum = Object.values(xpByDay).reduce((a, b) => a + b, 0);

  const words: Record<string, WordProgress> = {};
  if (isObj(input.words)) {
    for (const [id, w] of Object.entries(input.words)) {
      if (!WORD_BANK.has(id) || !isObj(w)) continue;
      const learnedAt = day(w.learnedAt, today);
      words[id] = {
        learnedAt,
        strength: num(w.strength, 1, 0, 5),
        due: day(w.due, today),
        seen: num(w.seen, 1, 0, 1_000_000),
        correct: num(w.correct, 0, 0, 1_000_000),
        wrong: num(w.wrong, 0, 0, 1_000_000),
        lastSeen: day(w.lastSeen, learnedAt),
      };
    }
  }

  const lessons: Record<string, LessonRecord> = {};
  if (isObj(input.lessons)) {
    for (const [id, l] of Object.entries(input.lessons)) {
      if (!LESSON_BY_ID.has(id) || !isObj(l)) continue;
      lessons[id] = {
        completedAt: day(l.completedAt, today),
        times: num(l.times, 1, 1, 1_000_000),
        bestAccuracy: num(l.bestAccuracy, 100, 0, 100),
      };
    }
  }

  const chests = Array.isArray(input.chests)
    ? [...new Set(input.chests.filter((c): c is string => typeof c === 'string' && CHEST_IDS.has(c)))]
    : [];
  const favorites = Array.isArray(input.favorites)
    ? [...new Set(input.favorites.filter((f): f is string => typeof f === 'string' && WORD_BANK.has(f)))]
    : [];

  const questList: QuestState[] = Array.isArray(quests.list)
    ? quests.list.filter(isObj).slice(0, 6).map((q) => ({
      id: str(q.id, 'xp', 40),
      target: num(q.target, 1, 1, 10_000),
      progress: num(q.progress, 0, 0, 10_000),
      reward: num(q.reward, 0, 0, 1_000),
      claimed: q.claimed === true,
    }))
    : [];

  const achievements: Record<string, number> = {};
  if (isObj(input.achievements)) {
    for (const [k, v] of Object.entries(input.achievements)) {
      if (/^[a-z][a-zA-Z]{1,30}$/.test(k)) achievements[k] = num(v, 0, 0, 20);
    }
  }

  const statsOut = emptyStats();
  for (const key of Object.keys(statsOut) as Array<keyof ProgressStats>) {
    statsOut[key] = num(stats[key], 0, 0, Number.MAX_SAFE_INTEGER);
  }

  const lastDay = isDayKey(streak.lastDay) ? streak.lastDay : null;
  const sectionId = typeof input.sectionId === 'string' && SECTION_BY_ID.has(input.sectionId) ? input.sectionId : DEFAULT_SECTION_ID;
  const goal = num(input.dailyGoal, DEFAULT_DAILY_GOAL, 1, 500);

  return {
    schema: PROGRESS_SCHEMA,
    version: PROGRESS_VERSION,
    createdAt: iso(input.createdAt, base.createdAt),
    updatedAt: iso(input.updatedAt, base.updatedAt),
    onboarded: input.onboarded === true,
    profile: {
      name: str(profile.name, DEFAULT_NAME, 40).trim() || DEFAULT_NAME,
      avatar: avatar(profile.avatar),
      joinedAt: day(profile.joinedAt, today),
    },
    sectionId,
    dailyGoal: (DAILY_GOALS as readonly number[]).includes(goal) ? goal : DEFAULT_DAILY_GOAL,
    xpByDay,
    xpTotal: Math.max(xpSum, num(input.xpTotal, 0, 0, 100_000_000)),
    streak: {
      current: num(streak.current, 0, 0, 100_000),
      best: num(streak.best, 0, 0, 100_000),
      lastDay,
      freezes: num(streak.freezes, 0, 0, MAX_FREEZES),
      frozenDays: Array.isArray(streak.frozenDays) ? streak.frozenDays.filter(isDayKey).slice(-60) : [],
    },
    gems: num(input.gems, START_GEMS, 0, 1_000_000),
    hearts: {
      count: num(hearts.count, MAX_HEARTS, 0, MAX_HEARTS),
      updatedAt: num(hearts.updatedAt, now.getTime(), 0, now.getTime()),
    },
    lessons,
    chests,
    words,
    favorites,
    quests: { day: day(quests.day, ''), list: questList },
    achievements,
    stats: statsOut,
  };
}

/* ——— Слияние двух устройств ——————————————————————————————— */

const maxRecord = (a: Record<string, number>, b: Record<string, number>): Record<string, number> => {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
};

const minDay = (a: string, b: string): string => (a <= b ? a : b);
const maxDay = (a: string, b: string): string => (a >= b ? a : b);

/**
 * Объединяет прогресс с двух устройств. Счётчики не суммируются,
 * а берётся максимум: файлы часто содержат общую историю, и сумма
 * удвоила бы её. Выученные слова и пройденные уроки объединяются.
 */
export function mergeProgress(current: Progress, incoming: Progress, now: Date = new Date()): Progress {
  const today = dayKey(now);

  const words: Record<string, WordProgress> = { ...current.words };
  for (const [id, w] of Object.entries(incoming.words)) {
    const mine = words[id];
    if (!mine) {
      words[id] = { ...w };
      continue;
    }
    const stronger = w.strength > mine.strength ? w : mine;
    words[id] = {
      learnedAt: minDay(mine.learnedAt, w.learnedAt),
      strength: stronger.strength,
      due: stronger.due,
      seen: Math.max(mine.seen, w.seen),
      correct: Math.max(mine.correct, w.correct),
      wrong: Math.max(mine.wrong, w.wrong),
      lastSeen: maxDay(mine.lastSeen, w.lastSeen),
    };
  }

  const lessons: Record<string, LessonRecord> = { ...current.lessons };
  for (const [id, l] of Object.entries(incoming.lessons)) {
    const mine = lessons[id];
    lessons[id] = mine
      ? { completedAt: minDay(mine.completedAt, l.completedAt), times: Math.max(mine.times, l.times), bestAccuracy: Math.max(mine.bestAccuracy, l.bestAccuracy) }
      : { ...l };
  }

  const xpByDay = maxRecord(current.xpByDay, incoming.xpByDay);
  const xpSum = Object.values(xpByDay).reduce((a, b) => a + b, 0);
  const frozenDays = [...new Set([...current.streak.frozenDays, ...incoming.streak.frozenDays])].sort().slice(-60);
  const activeDays = [...Object.keys(xpByDay), ...frozenDays];
  const rebuilt = streakFromDays(activeDays, today);

  const stats = emptyStats();
  for (const key of Object.keys(stats) as Array<keyof ProgressStats>) {
    stats[key] = Math.max(current.stats[key], incoming.stats[key]);
  }

  const nowMs = now.getTime();
  const heartsA = heartsNow(current.hearts, nowMs);
  const heartsB = heartsNow(incoming.hearts, nowMs);

  return {
    ...current,
    updatedAt: now.toISOString(),
    onboarded: true,
    profile: {
      name: current.profile.name === DEFAULT_NAME ? incoming.profile.name : current.profile.name,
      avatar: current.profile.avatar ?? incoming.profile.avatar,
      joinedAt: minDay(current.profile.joinedAt, incoming.profile.joinedAt),
    },
    xpByDay,
    xpTotal: Math.max(current.xpTotal, incoming.xpTotal, xpSum),
    streak: {
      current: Math.max(rebuilt.current, currentAlive(current, today), currentAlive(incoming, today)),
      best: Math.max(current.streak.best, incoming.streak.best, rebuilt.best),
      lastDay: rebuilt.lastDay && current.streak.lastDay
        ? maxDay(rebuilt.lastDay, current.streak.lastDay)
        : rebuilt.lastDay ?? current.streak.lastDay ?? incoming.streak.lastDay,
      freezes: Math.max(current.streak.freezes, incoming.streak.freezes),
      frozenDays,
    },
    gems: Math.max(current.gems, incoming.gems),
    hearts: heartsB > heartsA ? { ...incoming.hearts } : { ...current.hearts },
    lessons,
    chests: [...new Set([...current.chests, ...incoming.chests])],
    words,
    favorites: [...new Set([...current.favorites, ...incoming.favorites])],
    quests: current.quests.day >= incoming.quests.day ? current.quests : incoming.quests,
    achievements: maxRecord(current.achievements, incoming.achievements),
    stats,
  };
}

/** Серия считается живой, только если последний активный день — сегодня или вчера. */
function currentAlive(p: Progress, today: string): number {
  const last = p.streak.lastDay;
  return last && daysBetween(last, today) <= 1 ? p.streak.current : 0;
}

/* ——— Сводка для экранов и файла ————————————————————————————— */

export interface ProgressSummary {
  name: string;
  xp: number;
  streak: number;
  bestStreak: number;
  words: number;
  lessons: number;
  joinedAt: string;
}

export function summarize(p: Progress): ProgressSummary {
  return {
    name: p.profile.name,
    xp: p.xpTotal,
    streak: p.streak.current,
    bestStreak: p.streak.best,
    words: Object.keys(p.words).length,
    lessons: Object.keys(p.lessons).length,
    joinedAt: p.profile.joinedAt,
  };
}
