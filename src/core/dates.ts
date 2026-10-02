/**
 * Календарные дни в локальном часовом поясе.
 *
 * Раньше день считался через toISOString() — это UTC, и у
 * пользователя в Москве урок после полуночи засчитывался во
 * «вчера». Серия и цель дня завязаны на локальный календарь,
 * поэтому ключ дня собирается из локальных полей даты.
 */

/** Ключ дня вида 2026-10-01 в локальном времени. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Полночь (локальная) дня по ключу. */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isDayKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(key: string, days: number): string {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

/** Сколько календарных дней от a до b (b − a). Переход на летнее время не влияет. */
export function daysBetween(a: string, b: string): number {
  const ua = Date.UTC(...ymd(a));
  const ub = Date.UTC(...ymd(b));
  return Math.round((ub - ua) / 86_400_000);
}

const ymd = (key: string): [number, number, number] => {
  const [y, m, d] = key.split('-').map(Number);
  return [y, (m || 1) - 1, d || 1];
};

/** День недели: 0 — понедельник … 6 — воскресенье. */
export function weekdayIndex(key: string): number {
  return (fromDayKey(key).getDay() + 6) % 7;
}

/** Последние n дней, от старого к сегодняшнему. */
export function lastDays(n: number, today: string = dayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

/** Понедельник недели, в которую входит день. */
export function weekStart(key: string): string {
  return addDays(key, -weekdayIndex(key));
}

export const WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** «1 октября 2026» */
export function formatDayLong(key: string): string {
  const date = fromDayKey(key);
  return `${date.getDate()} ${MONTHS_GEN[date.getMonth()]} ${date.getFullYear()}`;
}

/** Русская форма слова по числу: plural(5, 'день', 'дня', 'дней') → 'дней'. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** «12 мин», «1 ч 05 мин» — для таймеров. */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.ceil(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} мин`;
  return `${h} ч ${String(m).padStart(2, '0')} мин`;
}

/** «2:31» — длительность урока. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
