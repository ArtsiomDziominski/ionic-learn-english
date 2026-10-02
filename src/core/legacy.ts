/**
 * Перенос прогресса из прежней версии приложения.
 *
 * Раньше данные лежали в разрозненных ключах localStorage:
 * выученные и избранные слова целиком, дни занятий, баллы.
 * При первом запуске новой версии они собираются в Progress,
 * а уроки, все слова которых уже выучены, отмечаются пройденными —
 * ученик продолжает с того места, где остановился.
 *
 * Старые ключи не удаляются: при откате на прошлую версию
 * приложения пользователь ничего не потеряет.
 */
import { addDays, dayKey, isDayKey } from './dates';
import { SECTIONS, WORD_BANK } from './course';
import { createProgress, MAX_HEARTS, START_GEMS, streakFromDays, type Progress } from './progress';

export const LEGACY_KEYS = {
  studied: 'studiedWords',
  favorites: 'favoritesWords',
  studyDays: 'studyDays',
  lastStudyDate: 'lastStudyDate',
  points: 'userPoints',
  dailyRepeats: 'dailyRepeats',
  avatar: 'userAvatar',
} as const;

type Reader = (key: string) => string | null;

const parse = <T>(read: Reader, key: string, fallback: T): T => {
  try {
    const raw = read(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const wordIds = (list: unknown): string[] => {
  if (!Array.isArray(list)) return [];
  const ids = list
    .map((w) => (w && typeof w === 'object' && typeof (w as { word?: unknown }).word === 'string' ? (w as { word: string }).word.trim().toLowerCase() : ''))
    .filter((id) => WORD_BANK.has(id));
  return [...new Set(ids)];
};

export function hasLegacyData(read: Reader): boolean {
  return Object.values(LEGACY_KEYS).some((key) => {
    const raw = read(key);
    return raw !== null && raw !== '' && raw !== '[]' && raw !== '0';
  });
}

export function migrateLegacy(read: Reader, now: Date = new Date()): Progress | null {
  if (!hasLegacyData(read)) return null;
  const today = dayKey(now);
  const progress = createProgress(now);

  const studied = wordIds(parse(read, LEGACY_KEYS.studied, []));
  const favorites = wordIds(parse(read, LEGACY_KEYS.favorites, []));

  for (const id of studied) {
    // Срок повтора — сегодня: слова сразу попадут в «Повторение»
    progress.words[id] = { learnedAt: today, strength: 2, due: today, seen: 1, correct: 1, wrong: 0, lastSeen: today };
  }
  progress.favorites = favorites;

  /* Дни занятий и баллы. Баллы прежней версии росли на 5 за каждое
     повторение дня (5, 10, 15…) — восстанавливаем их по дням как XP. */
  const days = parse<Array<{ date?: unknown; completed?: unknown }>>(read, LEGACY_KEYS.studyDays, [])
    .filter((d) => d && d.completed !== false && isDayKey(d.date))
    .map((d) => d.date as string);
  const repeats = parse<Array<{ date?: unknown; repeatCount?: unknown }>>(read, LEGACY_KEYS.dailyRepeats, []);
  for (const r of repeats) {
    const n = Number(r?.repeatCount);
    if (!isDayKey(r?.date) || !Number.isFinite(n) || n <= 0) continue;
    progress.xpByDay[r.date as string] = Math.round((5 * n * (n + 1)) / 2);
  }
  for (const d of days) if (!progress.xpByDay[d]) progress.xpByDay[d] = 10;

  const lastStudy = read(LEGACY_KEYS.lastStudyDate);
  const activeDays = [...Object.keys(progress.xpByDay), ...(isDayKey(lastStudy) ? [lastStudy] : [])];
  const streak = streakFromDays(activeDays, today);
  progress.streak = { ...progress.streak, current: streak.current, best: streak.best, lastDay: streak.lastDay };

  const xpSum = Object.values(progress.xpByDay).reduce((a, b) => a + b, 0);
  const points = Number(read(LEGACY_KEYS.points));
  progress.xpTotal = Math.max(xpSum, Number.isFinite(points) ? Math.round(points) : 0);

  const sortedDays = [...activeDays].sort();
  if (sortedDays[0]) progress.profile.joinedAt = sortedDays[0] < today ? sortedDays[0] : today;

  const avatar = read(LEGACY_KEYS.avatar);
  if (avatar && /^data:image\//.test(avatar) && avatar.length < 600_000) progress.profile.avatar = avatar;

  /* Уроки, все слова которых выучены, засчитываются; повторение
     юнита — если пройдены все его уроки. Сундуки остаются
     закрытыми: открыть их — приятный бонус после обновления. */
  const known = new Set(studied);
  let resumeSection: string | null = null;
  for (const section of SECTIONS) {
    for (const unit of section.units) {
      let allDone = true;
      for (const node of unit.nodes) {
        if (node.kind !== 'lesson') continue;
        if (node.lesson.words.every((w) => known.has(w))) {
          progress.lessons[node.id] = { completedAt: today, times: 1, bestAccuracy: 100 };
        } else {
          allDone = false;
        }
      }
      const review = unit.nodes.find((n) => n.kind === 'review');
      if (allDone && review) progress.lessons[review.id] = { completedAt: today, times: 1, bestAccuracy: 100 };
      if (!allDone && !resumeSection && section.kind === 'level' && unit.words.some((w) => known.has(w))) {
        resumeSection = section.id;
      }
    }
  }
  if (resumeSection) progress.sectionId = resumeSection;

  progress.onboarded = true;
  progress.gems = START_GEMS + 50;
  progress.hearts = { count: MAX_HEARTS, updatedAt: now.getTime() };
  progress.stats.lessons = Object.keys(progress.lessons).length;
  progress.stats.bestDayXp = Math.max(0, ...Object.values(progress.xpByDay));
  // Незавершённая вчерашняя серия не должна сгореть в первый же день
  if (progress.streak.lastDay && progress.streak.lastDay < addDays(today, -1)) progress.streak.current = 0;

  return progress;
}
