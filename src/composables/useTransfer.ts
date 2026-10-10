import { ref } from 'vue';
import { useProgressStore } from '@/store/progress';
import { useToastStore } from '@/store/toast';
import { buildProgressFile, parseProgressFile, progressFileName, serializeProgressFile, type ImportResult } from '@/core/transfer';
import { pickTextFile, saveFile, shareFile, shareText, type ShareOutcome } from '@/core/share';
import { renderShareCard } from '@/core/shareCard';
import { getSection } from '@/core/course';
import { plural } from '@/core/dates';
import { trackEvent } from '@/utils/analytics';

const APP_VERSION = '2.0.0';

/* Состояние общее для всех экранов: файл выбирают в профиле или
   на приветствии, а подтверждение показывает одна шторка в App.vue. */
const busy = ref(false);
const pending = ref<Extract<ImportResult, { ok: true }> | null>(null);
const SITE = 'https://www.learnenglisheasy.ru';

/**
 * Перенос и шаринг прогресса для экранов: собирает файл, вызывает
 * нужный способ отправки и сообщает результат тостом.
 */
export function useTransfer() {
  const progress = useProgressStore();
  const toast = useToastStore();

  const report = (outcome: ShareOutcome, what: string): void => {
    if (outcome === 'downloaded') toast.show(`${what} сохранён в «Загрузки»`, 'success', 'check');
    if (outcome === 'copied') toast.show('Текст скопирован — вставьте его в сообщение', 'success', 'check');
  };

  const fail = (error: unknown): void => {
    console.warn(error);
    toast.show('Не получилось. Попробуйте ещё раз', 'error');
  };

  const filePayload = () => {
    const content = serializeProgressFile(buildProgressFile(progress.snapshot(), APP_VERSION));
    return { name: progressFileName(), mime: 'application/json', content };
  };

  async function run(task: () => Promise<void>): Promise<void> {
    if (busy.value) return;
    busy.value = true;
    try {
      await task();
    } catch (error) {
      fail(error);
    } finally {
      busy.value = false;
    }
  }

  /** «Скачать файл прогресса». */
  const download = (): Promise<void> => run(async () => {
    const file = filePayload();
    const outcome = await saveFile({ ...file, title: 'Прогресс learnenglisheasy.ru' });
    report(outcome, 'Файл прогресса');
    if (outcome !== 'cancelled') trackEvent('progress_export', { kind: 'save', outcome });
  });

  /** «Отправить файл» — в мессенджер, на почту, в облако. */
  const sendFile = (): Promise<void> => run(async () => {
    const file = filePayload();
    const outcome = await shareFile({
      ...file,
      title: 'Мой прогресс на learnenglisheasy.ru',
      text: 'Файл прогресса learnenglisheasy.ru. Откройте приложение → Профиль → «Загрузить файл».',
    });
    report(outcome, 'Файл прогресса');
    if (outcome !== 'cancelled') trackEvent('progress_export', { kind: 'send', outcome });
  });

  /** «Поделиться успехами» — картинка с серией, XP и словами. */
  const shareCard = (): Promise<void> => run(async () => {
    const s = progress.state;
    const words = progress.learnedCount;
    const blob = await renderShareCard({
      name: s.profile.name,
      streak: progress.streak,
      xp: s.xpTotal,
      words,
      level: getSection(s.sectionId).badge,
    });
    const text = `Учу английский на learnenglisheasy.ru: ${progress.streak} ${plural(progress.streak, 'день', 'дня', 'дней')} подряд, ${words} ${plural(words, 'слово', 'слова', 'слов')} и ${s.xpTotal} XP!`;
    try {
      const outcome = await shareFile({ name: 'learnenglisheasy-progress.png', mime: 'image/png', content: blob, title: 'Мои успехи', text: `${text} ${SITE}` });
      report(outcome, 'Картинка');
      if (outcome !== 'cancelled') trackEvent('share', { content_type: 'progress_card', method: outcome });
    } catch {
      const outcome = await shareText('Мои успехи', text, SITE);
      report(outcome, 'Текст');
      if (outcome !== 'cancelled') trackEvent('share', { content_type: 'progress_card', method: outcome });
    }
  });

  /** Выбор файла и разбор — без применения: сначала показываем превью. */
  const chooseFile = (): Promise<void> => run(async () => {
    const picked = await pickTextFile();
    if (!picked) return;
    const parsed = parseProgressFile(picked.text);
    if (!parsed.ok) {
      toast.show(parsed.error, 'error');
      return;
    }
    pending.value = parsed;
  });

  const applyImport = (mode: 'replace' | 'merge'): void => {
    if (!pending.value) return;
    if (mode === 'replace') progress.replaceWith(pending.value.progress);
    else progress.mergeWith(pending.value.progress);
    trackEvent('progress_import', { mode });
    pending.value = null;
    toast.show(mode === 'replace' ? 'Прогресс загружен' : 'Прогресс объединён', 'success', 'check');
  };

  const cancelImport = (): void => {
    pending.value = null;
  };

  return { busy, pending, download, sendFile, shareCard, chooseFile, applyImport, cancelImport };
}
