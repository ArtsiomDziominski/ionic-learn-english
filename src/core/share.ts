/**
 * Отправка и сохранение файлов без сервера.
 *
 *  - Android-приложение: файл пишется во временную папку
 *    (Filesystem, Cache) и уходит в системное меню «Поделиться»,
 *    откуда его можно сохранить на диск или отправить в мессенджер.
 *  - Браузер: Web Share API с файлами, если поддерживается
 *    (мобильный Chrome/Safari), иначе — обычное скачивание.
 */
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export type ShareOutcome = 'shared' | 'downloaded' | 'copied' | 'cancelled';

const isNative = (): boolean => Capacitor.isNativePlatform();

const isAbort = (error: unknown): boolean =>
  error instanceof DOMException ? error.name === 'AbortError' : /cancel/i.test(String((error as { message?: string })?.message ?? error));

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const step = 0x8000;
  for (let i = 0; i < buffer.length; i += step) {
    binary += String.fromCharCode(...buffer.subarray(i, i + step));
  }
  return btoa(binary);
}

function download(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function writeNative(name: string, content: string | Blob): Promise<string> {
  const result = typeof content === 'string'
    ? await Filesystem.writeFile({ path: name, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 })
    : await Filesystem.writeFile({ path: name, data: await blobToBase64(content), directory: Directory.Cache });
  return result.uri;
}

interface FilePayload {
  name: string;
  mime: string;
  content: string | Blob;
  title: string;
  text?: string;
}

/** «Поделиться» файлом; если браузер не умеет — скачивание. */
export async function shareFile(file: FilePayload): Promise<ShareOutcome> {
  try {
    if (isNative()) {
      const uri = await writeNative(file.name, file.content);
      await Share.share({ title: file.title, text: file.text, files: [uri], dialogTitle: file.title });
      return 'shared';
    }
    const blob = typeof file.content === 'string' ? new Blob([file.content], { type: file.mime }) : file.content;
    const webFile = new File([blob], file.name, { type: file.mime });
    if (navigator.canShare?.({ files: [webFile] })) {
      await navigator.share({ files: [webFile], title: file.title, text: file.text });
      return 'shared';
    }
    download(file.name, blob);
    return 'downloaded';
  } catch (error) {
    if (isAbort(error)) return 'cancelled';
    throw error;
  }
}

/** Сохранить файл: в браузере — скачивание, в приложении — через меню «Поделиться» → «Сохранить». */
export async function saveFile(file: FilePayload): Promise<ShareOutcome> {
  if (isNative()) return shareFile(file);
  const blob = typeof file.content === 'string' ? new Blob([file.content], { type: file.mime }) : file.content;
  download(file.name, blob);
  return 'downloaded';
}

/** Поделиться текстом и ссылкой; без Web Share — копирование в буфер. */
export async function shareText(title: string, text: string, url?: string): Promise<ShareOutcome> {
  try {
    if (isNative()) {
      await Share.share({ title, text, url, dialogTitle: title });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return 'shared';
    }
    await navigator.clipboard.writeText(url ? `${text} ${url}` : text);
    return 'copied';
  } catch (error) {
    if (isAbort(error)) return 'cancelled';
    throw error;
  }
}

/** Выбор файла пользователем. Работает и в Android WebView (Capacitor обрабатывает file input). */
export function pickTextFile(accept = '.json,application/json,text/plain'): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    let settled = false;
    const finish = (value: { name: string; text: string } | null): void => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(value);
    };
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      try {
        finish({ name: file.name, text: await file.text() });
      } catch {
        finish(null);
      }
    });
    // Окно выбора закрыли без файла
    input.addEventListener('cancel', () => finish(null));
    document.body.appendChild(input);
    input.click();
  });
}
