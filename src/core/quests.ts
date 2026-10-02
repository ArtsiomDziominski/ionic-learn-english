/**
 * Ежедневные задания. Набор на день выбирается детерминированно
 * по дате: в течение дня он не меняется при перезапуске, а на
 * следующий день — другой. Сервер для этого не нужен.
 */
import { plural } from './dates';
import type { QuestState } from './progress';

export type QuestIcon = 'bolt' | 'book' | 'target' | 'star' | 'sparkle' | 'dumbbell' | 'headphones';

interface QuestTemplate {
  id: string;
  icon: QuestIcon;
  targets: number[];
  reward: number;
  title: (n: number) => string;
  /** Требует озвучки — без неё задание не выдаётся. */
  needsAudio?: boolean;
}

const TEMPLATES: QuestTemplate[] = [
  { id: 'xp', icon: 'bolt', targets: [20, 30, 40], reward: 10, title: (n) => `Заработайте ${n} XP` },
  { id: 'lessons', icon: 'book', targets: [2, 3], reward: 15, title: (n) => `Пройдите ${n} ${plural(n, 'урок', 'урока', 'уроков')}` },
  { id: 'combo', icon: 'target', targets: [8, 10, 12], reward: 10, title: (n) => `Ответьте верно ${n} ${plural(n, 'раз', 'раза', 'раз')} подряд` },
  { id: 'perfect', icon: 'star', targets: [1], reward: 15, title: () => 'Пройдите урок без ошибок' },
  { id: 'newWords', icon: 'sparkle', targets: [4, 8], reward: 10, title: (n) => `Выучите ${n} ${plural(n, 'новое слово', 'новых слова', 'новых слов')}` },
  { id: 'practice', icon: 'dumbbell', targets: [1], reward: 10, title: () => 'Пройдите тренировку' },
  { id: 'listen', icon: 'headphones', targets: [5, 8], reward: 10, needsAudio: true, title: (n) => `Ответьте верно на слух ${n} ${plural(n, 'раз', 'раза', 'раз')}` },
];

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));

/** Детерминированный генератор по строке (mulberry32 от хеша). */
function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Три задания на день; «Заработайте XP» есть всегда. */
export function generateDailyQuests(day: string, audio: boolean): QuestState[] {
  const rand = seeded(`quests:${day}`);
  const pool = TEMPLATES.filter((t) => t.id !== 'xp' && (audio || !t.needsAudio));
  const picked: QuestTemplate[] = [BY_ID.get('xp') as QuestTemplate];
  while (picked.length < 3 && pool.length) {
    picked.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return picked.map((t) => ({
    id: t.id,
    target: t.targets[Math.floor(rand() * t.targets.length)],
    progress: 0,
    reward: t.reward,
    claimed: false,
  }));
}

export interface QuestEvent {
  xp: number;
  lessons: number;
  bestCombo: number;
  perfect: number;
  newWords: number;
  practice: number;
  listenCorrect: number;
}

/** Применяет итоги урока к заданиям. Комбо — рекорд, а не сумма. */
export function applyQuestEvent(list: QuestState[], ev: QuestEvent): QuestState[] {
  return list.map((q) => {
    if (q.progress >= q.target) return q;
    let progress = q.progress;
    switch (q.id) {
      case 'xp': progress += ev.xp; break;
      case 'lessons': progress += ev.lessons; break;
      case 'combo': progress = Math.max(progress, ev.bestCombo); break;
      case 'perfect': progress += ev.perfect; break;
      case 'newWords': progress += ev.newWords; break;
      case 'practice': progress += ev.practice; break;
      case 'listen': progress += ev.listenCorrect; break;
    }
    return { ...q, progress: Math.min(q.target, progress) };
  });
}

export function questTitle(q: QuestState): string {
  return BY_ID.get(q.id)?.title(q.target) ?? 'Задание';
}

export function questIcon(q: QuestState): QuestIcon {
  return BY_ID.get(q.id)?.icon ?? 'star';
}

export const isQuestDone = (q: QuestState): boolean => q.progress >= q.target;
