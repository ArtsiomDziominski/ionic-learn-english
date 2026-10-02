/**
 * Интервальное повторение по «ящикам» Лейтнера.
 *
 * Сила слова — номер ящика 0–5. Верный ответ переносит слово
 * в следующий ящик и отодвигает повтор, ошибка откатывает на два
 * ящика назад и ставит повтор на сегодня. Этого хватает, чтобы
 * «Повторение» на вкладке «Практика» предлагало действительно
 * забываемые слова, без тяжёлых алгоритмов вроде SM-2.
 */
import { addDays, daysBetween } from './dates';
import type { WordProgress } from './progress';

/** Через сколько дней повторять слово в каждом ящике. */
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];
export const MAX_STRENGTH = SRS_INTERVALS.length - 1;

export function learnWord(today: string): WordProgress {
  return {
    learnedAt: today,
    strength: 1,
    due: addDays(today, SRS_INTERVALS[1]),
    seen: 0,
    correct: 0,
    wrong: 0,
    lastSeen: today,
  };
}

/** Обновляет слово по итогам ответа. Для невыученного слова создаёт запись. */
export function reviewWord(word: WordProgress | undefined, correct: boolean, today: string): WordProgress {
  const base = word ?? learnWord(today);
  const strength = correct
    ? Math.min(MAX_STRENGTH, base.strength + (base.due <= today ? 1 : 0))
    : Math.max(0, base.strength - 2);
  const due = correct ? addDays(today, SRS_INTERVALS[strength] || 1) : today;
  return {
    ...base,
    strength,
    due: correct && base.due > today ? base.due : due,
    seen: base.seen + 1,
    correct: base.correct + (correct ? 1 : 0),
    wrong: base.wrong + (correct ? 0 : 1),
    lastSeen: today,
  };
}

export function isDue(word: WordProgress, today: string): boolean {
  return word.due <= today;
}

/** «Сложное» слово — ошибок заметно больше, чем у остальных. */
export function isWeak(word: WordProgress): boolean {
  return word.wrong > 0 && word.wrong >= Math.max(1, word.correct / 2);
}

/** Шкала силы для интерфейса: 0–4 полоски. */
export function strengthBars(word: WordProgress | undefined, today: string): number {
  if (!word) return 0;
  const overdue = daysBetween(word.due, today);
  const base = Math.ceil((word.strength / MAX_STRENGTH) * 4);
  // Просроченное слово «тускнеет»: так видно, что его пора повторить
  return Math.max(1, Math.min(4, base - (overdue > 3 ? 1 : 0)));
}
