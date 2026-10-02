/**
 * Достижения с уровнями, как значки в профиле Duolingo:
 * у каждого несколько порогов, за каждый новый уровень —
 * кристаллы. Метрики считаются из прогресса, отдельно ничего
 * не хранится, кроме того, какие уровни уже выданы.
 */
import type { Progress } from './progress';
import { plural } from './dates';

export type AchievementIcon = 'flame' | 'book' | 'bolt' | 'trophy' | 'star' | 'target' | 'heart' | 'dumbbell' | 'crown' | 'sun' | 'moon';

export interface AchievementDef {
  id: string;
  title: string;
  icon: AchievementIcon;
  color: string;
  tiers: number[];
  describe: (n: number) => string;
}

export interface AchievementMetrics {
  bestStreak: number;
  words: number;
  xp: number;
  lessons: number;
  perfect: number;
  bestCombo: number;
  favorites: number;
  practice: number;
  units: number;
  early: number;
  late: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'streak', title: 'Огонь не гаснет', icon: 'flame', color: '#FF9600', tiers: [3, 7, 14, 30, 100, 365], describe: (n) => `Серия ${n} ${plural(n, 'день', 'дня', 'дней')} подряд` },
  { id: 'words', title: 'Полиглот', icon: 'book', color: '#1CB0F6', tiers: [10, 50, 100, 250, 500, 1000], describe: (n) => `Выучите ${n} ${plural(n, 'слово', 'слова', 'слов')}` },
  { id: 'xp', title: 'Мудрец', icon: 'bolt', color: '#FFC800', tiers: [100, 500, 1000, 2500, 5000, 10000], describe: (n) => `Наберите ${n} XP` },
  { id: 'lessons', title: 'Прилежный ученик', icon: 'trophy', color: '#7C5CFF', tiers: [1, 10, 25, 50, 100, 250], describe: (n) => `Пройдите ${n} ${plural(n, 'урок', 'урока', 'уроков')}` },
  { id: 'perfect', title: 'Перфекционист', icon: 'star', color: '#FF4B4B', tiers: [1, 5, 20, 50, 100], describe: (n) => `${n} ${plural(n, 'урок', 'урока', 'уроков')} без ошибок` },
  { id: 'combo', title: 'Снайпер', icon: 'target', color: '#00C2A8', tiers: [5, 10, 15, 25, 40], describe: (n) => `${n} верных ответов подряд` },
  { id: 'units', title: 'Покоритель', icon: 'crown', color: '#58CC02', tiers: [1, 3, 10, 25, 50], describe: (n) => `Завершите ${n} ${plural(n, 'юнит', 'юнита', 'юнитов')}` },
  { id: 'practice', title: 'Трудяга', icon: 'dumbbell', color: '#FF6FB5', tiers: [1, 10, 25, 50], describe: (n) => `${n} ${plural(n, 'тренировка', 'тренировки', 'тренировок')}` },
  { id: 'favorites', title: 'Коллекционер', icon: 'heart', color: '#FF6F8E', tiers: [5, 25, 50, 100], describe: (n) => `Добавьте в избранное ${n} ${plural(n, 'слово', 'слова', 'слов')}` },
  { id: 'early', title: 'Ранняя пташка', icon: 'sun', color: '#FFB020', tiers: [1, 10, 30], describe: (n) => `${n} ${plural(n, 'урок', 'урока', 'уроков')} до 8 утра` },
  { id: 'late', title: 'Ночная сова', icon: 'moon', color: '#5B6CFF', tiers: [1, 10, 30], describe: (n) => `${n} ${plural(n, 'урок', 'урока', 'уроков')} после 22:00` },
];

export function metricsOf(p: Progress, unitsCompleted: number): AchievementMetrics {
  return {
    bestStreak: Math.max(p.streak.best, p.streak.current),
    words: Object.keys(p.words).length,
    xp: p.xpTotal,
    lessons: p.stats.lessons,
    perfect: p.stats.perfectLessons,
    bestCombo: p.stats.bestCombo,
    favorites: p.favorites.length,
    practice: p.stats.practice,
    units: unitsCompleted,
    early: p.stats.earlyLessons,
    late: p.stats.lateLessons,
  };
}

const metricKey: Record<string, keyof AchievementMetrics> = {
  streak: 'bestStreak',
  words: 'words',
  xp: 'xp',
  lessons: 'lessons',
  perfect: 'perfect',
  combo: 'bestCombo',
  units: 'units',
  practice: 'practice',
  favorites: 'favorites',
  early: 'early',
  late: 'late',
};

export interface AchievementView {
  def: AchievementDef;
  value: number;
  /** Сколько уровней достигнуто (0 — ни одного). */
  tier: number;
  /** Следующий порог; null — все уровни взяты. */
  next: number | null;
  /** Доля пути до следующего порога 0–1. */
  ratio: number;
}

export function achievementViews(m: AchievementMetrics): AchievementView[] {
  return ACHIEVEMENTS.map((def) => {
    const value = m[metricKey[def.id]];
    const tier = def.tiers.filter((t) => value >= t).length;
    const next = def.tiers[tier] ?? null;
    const prev = tier > 0 ? def.tiers[tier - 1] : 0;
    const ratio = next === null ? 1 : Math.min(1, Math.max(0, (value - prev) / (next - prev)));
    return { def, value, tier, next, ratio };
  });
}

export const tierReward = (tier: number): number => 10 + tier * 10;

/** Новые уровни, которые ещё не выданы: [{ id, tier }]. */
export function newlyEarned(views: AchievementView[], granted: Record<string, number>): Array<{ view: AchievementView; tier: number }> {
  const out: Array<{ view: AchievementView; tier: number }> = [];
  for (const view of views) {
    const had = granted[view.def.id] ?? 0;
    for (let t = had + 1; t <= view.tier; t++) out.push({ view, tier: t });
  }
  return out;
}
