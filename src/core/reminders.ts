/**
 * Расписание локальных уведомлений. Чистая логика без плагинов,
 * чтобы её можно было проверить тестом.
 *
 * Правила «не спамить»:
 *  - напоминание одно: на следующий день после последнего визита в
 *    REMIND_HOUR. Если человек и тогда не зашёл, новых не будет —
 *    расписание обновляется только когда приложение уходит в фон;
 *  - «жизни восстановились» — тоже одно, и только если их было
 *    мало (≤ LOW_HEARTS), когда человек вышел из приложения;
 *  - ночью (QUIET_FROM–QUIET_TO) ничего не приходит: уведомление
 *    переносится на утро.
 */
import { HEART_REGEN_MS, MAX_HEARTS, settleHearts, type Progress } from './progress';
import { plural } from './dates';

export const REMINDER_ID = 1001;
export const HEARTS_ID = 1002;

export const REMIND_HOUR = 19;
export const QUIET_FROM = 22;
export const QUIET_TO = 9;
/** Уведомление о жизнях — только если осталось столько или меньше. */
export const LOW_HEARTS = 2;

export interface PlannedNotification {
  id: number;
  at: Date;
  title: string;
  body: string;
}

export interface ReminderInput {
  now: Date;
  hearts: Progress['hearts'];
  heartsEnabled: boolean;
  /** Текущая серия (сгоревшая — 0). */
  streak: number;
}

/** Не будить ночью: время из тихих часов переносится на QUIET_TO утра. */
export function outsideQuietHours(at: Date): Date {
  const h = at.getHours();
  if (h >= QUIET_TO && h < QUIET_FROM) return at;
  const out = new Date(at);
  if (h >= QUIET_FROM) out.setDate(out.getDate() + 1);
  out.setHours(QUIET_TO, 0, 0, 0);
  return out;
}

/** Завтра в REMIND_HOUR по местному времени. */
export function nextDayReminderAt(now: Date): Date {
  const at = new Date(now);
  at.setDate(at.getDate() + 1);
  at.setHours(REMIND_HOUR, 0, 0, 0);
  return at;
}

/** Когда запас жизней станет полным; null — уже полный. */
export function heartsFullAt(hearts: Progress['hearts'], nowMs: number): number | null {
  const settled = settleHearts(hearts, nowMs);
  if (settled.count >= MAX_HEARTS) return null;
  return settled.updatedAt + (MAX_HEARTS - settled.count) * HEART_REGEN_MS;
}

export function planNotifications(input: ReminderInput): PlannedNotification[] {
  const { now, hearts, heartsEnabled, streak } = input;
  const out: PlannedNotification[] = [];

  out.push({
    id: REMINDER_ID,
    at: nextDayReminderAt(now),
    title: streak > 1 ? `Серия ${streak} ${plural(streak, 'день', 'дня', 'дней')} ждёт вас` : 'Пора повторить слова',
    body: streak > 1
      ? 'Пять минут сегодня, и серия продолжится.'
      : 'Пять минут сегодня, и новые слова запомнятся надолго.',
  });

  if (heartsEnabled) {
    const settled = settleHearts(hearts, now.getTime());
    const fullAt = heartsFullAt(hearts, now.getTime());
    if (fullAt !== null && settled.count <= LOW_HEARTS) {
      out.push({
        id: HEARTS_ID,
        at: outsideQuietHours(new Date(fullAt)),
        title: 'Жизни восстановились ❤️',
        body: 'Все жизни снова на месте. Можно продолжать уроки!',
      });
    }
  }

  return out;
}
