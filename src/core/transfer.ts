/**
 * Файл прогресса: формат обмена между устройствами и версиями.
 *
 * Внутри — сам Progress плюс «обёртка» с типом файла, версией
 * схемы и короткой сводкой (её показываем до импорта). Файл
 * человекочитаемый JSON: его можно отправить в мессенджере,
 * сохранить в облако и загрузить на другом устройстве.
 */
import { dayKey } from './dates';
import { PROGRESS_SCHEMA, PROGRESS_VERSION, sanitizeProgress, summarize, type Progress, type ProgressSummary } from './progress';

export const FILE_APP = 'slova-day';
export const FILE_KIND = 'progress';
export const MAX_FILE_CHARS = 5_000_000;

export interface ProgressFile {
  app: typeof FILE_APP;
  kind: typeof FILE_KIND;
  version: number;
  exportedAt: string;
  appVersion: string;
  summary: ProgressSummary;
  progress: Progress;
}

export function buildProgressFile(progress: Progress, appVersion: string, now: Date = new Date()): ProgressFile {
  return {
    app: FILE_APP,
    kind: FILE_KIND,
    version: PROGRESS_VERSION,
    exportedAt: now.toISOString(),
    appVersion,
    summary: summarize(progress),
    progress,
  };
}

export const serializeProgressFile = (file: ProgressFile): string => JSON.stringify(file, null, 2);

export const progressFileName = (now: Date = new Date()): string => `slova-day-progress-${dayKey(now)}.json`;

export type ImportResult =
  | { ok: true; progress: Progress; summary: ProgressSummary; exportedAt: string | null }
  | { ok: false; error: string };

const NOT_OUR_FILE = 'Это не файл прогресса Слова.Day. Выберите файл, сохранённый в приложении.';

export function parseProgressFile(text: string, now: Date = new Date()): ImportResult {
  if (text.length > MAX_FILE_CHARS) return { ok: false, error: 'Файл слишком большой для файла прогресса.' };

  let data: unknown;
  try {
    // Файл, сохранённый «Блокнотом», может начинаться с BOM — отрезаем его
    data = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return { ok: false, error: NOT_OUR_FILE };
  }
  if (typeof data !== 'object' || data === null) return { ok: false, error: NOT_OUR_FILE };

  const obj = data as Record<string, unknown>;
  // Поддерживаем и «голый» Progress без обёртки — на случай ручного сохранения
  const raw = obj.app === FILE_APP && obj.kind === FILE_KIND ? obj.progress : obj.schema === PROGRESS_SCHEMA ? obj : null;
  if (!raw || typeof raw !== 'object') return { ok: false, error: NOT_OUR_FILE };

  const version = Number((obj.app === FILE_APP ? obj.version : (raw as Record<string, unknown>).version) ?? 1);
  if (Number.isFinite(version) && version > PROGRESS_VERSION) {
    return { ok: false, error: 'Файл сохранён в более новой версии приложения. Обновите приложение и попробуйте снова.' };
  }

  const progress = sanitizeProgress(raw, now);
  progress.onboarded = true;
  const exportedAt = typeof obj.exportedAt === 'string' && !Number.isNaN(Date.parse(obj.exportedAt)) ? obj.exportedAt : null;
  return { ok: true, progress, summary: summarize(progress), exportedAt };
}
