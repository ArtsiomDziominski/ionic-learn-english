/**
 * «Мои слова»: группы слов, которые ученик добавляет сам —
 * из сериала, книги, с работы.
 *
 * Группы хранятся в прогрессе (переезжают вместе с файлом
 * прогресса), а сами слова регистрируются в общем банке слов
 * с id вида «my:word». Так уроки, повторение, словарь ошибок
 * и избранное работают с ними так же, как со словами курса.
 *
 * Группой можно поделиться отдельным JSON-файлом: внутри только
 * название и пары «слово — перевод», без прогресса ученика.
 */
import { WORD_BANK, type BankWord } from './course';

export interface MyWord {
  word: string;
  translation: string;
}

export interface WordGroup {
  id: string;
  name: string;
  createdAt: string;
  words: MyWord[];
}

export const MY_PREFIX = 'my:';
export const MAX_GROUPS = 100;
export const MAX_GROUP_WORDS = 500;
export const MAX_WORD_LEN = 60;
export const MAX_NAME_LEN = 40;

export const GROUP_FILE_APP = 'slova-day';
export const GROUP_FILE_KIND = 'word-group';
export const GROUP_FILE_VERSION = 1;

type Raw = Record<string, unknown>;
const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const clean = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '';

/** id слова в банке: одно и то же слово в разных группах — одно слово. */
export const myWordId = (word: string): string => MY_PREFIX + word.trim().toLowerCase();
export const isMyWordId = (id: string): boolean => id.startsWith(MY_PREFIX);

export const newGroupId = (): string =>
  `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Пара «слово — перевод» из ввода; null — пара неполная. */
export function cleanWord(word: unknown, translation: unknown): MyWord | null {
  const w = clean(word, MAX_WORD_LEN);
  const t = clean(translation, MAX_WORD_LEN * 2);
  return w && t ? { word: w, translation: t } : null;
}

function cleanWords(input: unknown): MyWord[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: MyWord[] = [];
  for (const item of input) {
    if (!isObj(item)) continue;
    const w = cleanWord(item.word, item.translation);
    if (!w) continue;
    const key = w.word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
    if (out.length >= MAX_GROUP_WORDS) break;
  }
  return out;
}

/** Группы из недоверенных данных (файл, localStorage). */
export function sanitizeGroups(input: unknown, nowIso: string): WordGroup[] {
  if (!Array.isArray(input)) return [];
  const ids = new Set<string>();
  const out: WordGroup[] = [];
  for (const g of input) {
    if (!isObj(g)) continue;
    const id = typeof g.id === 'string' && /^[a-z0-9]{2,24}$/.test(g.id) && !ids.has(g.id) ? g.id : newGroupId();
    ids.add(id);
    out.push({
      id,
      name: clean(g.name, MAX_NAME_LEN) || 'Мои слова',
      createdAt: typeof g.createdAt === 'string' && !Number.isNaN(Date.parse(g.createdAt)) ? g.createdAt : nowIso,
      words: cleanWords(g.words),
    });
    if (out.length >= MAX_GROUPS) break;
  }
  return out;
}

/** Все id слов из групп. */
export function groupWordIds(groups: WordGroup[]): Set<string> {
  const ids = new Set<string>();
  for (const g of groups) for (const w of g.words) ids.add(myWordId(w.word));
  return ids;
}

/** Слияние групп с двух устройств: группы по id, слова объединяются. */
export function mergeGroups(current: WordGroup[], incoming: WordGroup[]): WordGroup[] {
  const out = current.map((g) => ({ ...g, words: [...g.words] }));
  for (const g of incoming) {
    const mine = out.find((x) => x.id === g.id);
    if (!mine) {
      out.push({ ...g, words: [...g.words] });
      continue;
    }
    const have = new Set(mine.words.map((w) => w.word.toLowerCase()));
    for (const w of g.words) if (!have.has(w.word.toLowerCase())) mine.words.push({ ...w });
  }
  return out.slice(0, MAX_GROUPS);
}

const meanings = (translation: string): string[] =>
  translation.split(/[,;]/).map((t) => t.trim()).filter(Boolean);

const registered = new Set<string>();

/**
 * Регистрирует слова групп в общем банке. Слово, которое есть
 * в нескольких группах, берёт перевод из первой.
 */
export function syncMyWords(groups: WordGroup[]): void {
  for (const id of registered) WORD_BANK.delete(id);
  registered.clear();
  for (const g of groups) {
    for (const w of g.words) {
      const id = myWordId(w.word);
      if (registered.has(id)) continue;
      const entry: BankWord = { id, word: w.word, translations: meanings(w.translation), translation: w.translation, tags: ['my'] };
      if (!entry.translations.length) entry.translations = [w.translation];
      WORD_BANK.set(id, entry);
      registered.add(id);
    }
  }
}

/** Перевод из словаря курса — подсказка при добавлении слова. */
export function suggestTranslation(word: string): string {
  return WORD_BANK.get(word.trim().toLowerCase())?.translation ?? '';
}

/* ——— Файл группы ——————————————————————————————————————————— */

export interface GroupFile {
  app: typeof GROUP_FILE_APP;
  kind: typeof GROUP_FILE_KIND;
  version: number;
  name: string;
  words: MyWord[];
}

export const serializeGroupFile = (group: WordGroup): string =>
  JSON.stringify({ app: GROUP_FILE_APP, kind: GROUP_FILE_KIND, version: GROUP_FILE_VERSION, name: group.name, words: group.words } satisfies GroupFile, null, 2);

export const groupFileName = (group: WordGroup): string => {
  const slug = group.name.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 30);
  return `learnenglisheasy-words-${slug || 'group'}.json`;
};

export type GroupImport = { ok: true; name: string; words: MyWord[] } | { ok: false; error: string };

const NOT_GROUP = 'Это не файл группы слов. Выберите файл, которым поделились из «Моих слов».';

/** Разбор файла группы. Подходит и простой список [{ word, translation }]. */
export function parseGroupFile(text: string): GroupImport {
  if (text.length > 1_000_000) return { ok: false, error: 'Файл слишком большой для группы слов.' };
  let data: unknown;
  try {
    data = JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
  } catch {
    return { ok: false, error: NOT_GROUP };
  }
  let name = '';
  let rawWords: unknown;
  if (Array.isArray(data)) {
    rawWords = data;
  } else if (isObj(data) && data.kind === GROUP_FILE_KIND) {
    if (Number(data.version ?? 1) > GROUP_FILE_VERSION) {
      return { ok: false, error: 'Файл сохранён в более новой версии приложения. Обновите приложение и попробуйте снова.' };
    }
    name = clean(data.name, MAX_NAME_LEN);
    rawWords = data.words;
  } else {
    return { ok: false, error: NOT_GROUP };
  }
  const words = cleanWords(rawWords);
  if (!words.length) return { ok: false, error: 'В файле нет ни одного слова с переводом.' };
  return { ok: true, name: name || 'Новая группа', words };
}
