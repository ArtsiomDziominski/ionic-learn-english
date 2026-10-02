/**
 * Сборка урока из слов.
 *
 * Порядок повторяет педагогику Duolingo: знакомство со словом →
 * узнавание (выбрать перевод) → сопоставление пар → воспроизведение
 * (собрать из букв, выбрать английское слово, набрать, узнать на
 * слух) → повтор старых слов. Новые слова вводятся парами, чтобы
 * между знакомством и проверкой было немного «забывания».
 */
import type { BankWord } from './course';

export type ExerciseType = 'intro' | 'choice' | 'listen' | 'match' | 'tiles' | 'type';
export type Direction = 'en-ru' | 'ru-en';

export interface ChoiceOption {
  /** id слова, которому принадлежит вариант. */
  wordId: string;
  label: string;
}

export interface Exercise {
  key: string;
  type: ExerciseType;
  wordId: string;
  direction: Direction;
  options?: ChoiceOption[];
  /** Для сопоставления — слова пар. */
  pairIds?: string[];
  isNew?: boolean;
  isRetry?: boolean;
}

export type PracticeMode = 'mistakes' | 'review' | 'listening' | 'spelling' | 'favorites' | 'quick';

export interface BuildOptions {
  /** Можно ли озвучивать слова — без этого задания на слух не создаются. */
  listening: boolean;
  /** Пул слов для неверных вариантов. */
  pool: BankWord[];
}

let keyCounter = 0;
const nextKey = (): string => `ex${++keyCounter}`;

export function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const hasSpaces = (w: BankWord): boolean => /\s/.test(w.word);

/** Собирать из букв удобно короткие однословные слова. */
const canTiles = (w: BankWord): boolean => !hasSpaces(w) && w.word.length >= 2 && w.word.length <= 12 && /^[a-zA-Z'-]+$/.test(w.word);
/** Набирать с клавиатуры — всё, кроме очень длинных фраз. */
const canType = (w: BankWord): boolean => w.word.length <= 18;

/** Неверные варианты: без повторов подписей и без слов с тем же переводом. */
function distractors(target: BankWord, pool: BankWord[], direction: Direction, count: number): ChoiceOption[] {
  const label = (w: BankWord): string => (direction === 'en-ru' ? w.translation : w.word);
  const taken = new Set([label(target).toLowerCase(), ...target.translations.map((t) => t.toLowerCase())]);
  const lengthOf = (w: BankWord): number => label(w).length;
  const targetLen = lengthOf(target);

  // Сначала похожие по длине — так вариант не отбрасывается «на глаз»
  const candidates = shuffle(pool.filter((w) => w.id !== target.id));
  candidates.sort((a, b) => Math.abs(lengthOf(a) - targetLen) - Math.abs(lengthOf(b) - targetLen));
  const preferred = candidates.slice(0, Math.max(count * 4, 12));

  const out: ChoiceOption[] = [];
  for (const w of shuffle(preferred).concat(candidates)) {
    if (out.length >= count) break;
    const l = label(w);
    const key = l.toLowerCase();
    if (taken.has(key)) continue;
    if (direction === 'en-ru' && w.translations.some((t) => target.translations.includes(t))) continue;
    taken.add(key);
    out.push({ wordId: w.id, label: l });
  }
  return out;
}

function choice(word: BankWord, direction: Direction, opts: BuildOptions, isNew = false): Exercise {
  const correct: ChoiceOption = { wordId: word.id, label: direction === 'en-ru' ? word.translation : word.word };
  return {
    key: nextKey(),
    type: 'choice',
    wordId: word.id,
    direction,
    options: shuffle([correct, ...distractors(word, opts.pool, direction, 3)]),
    isNew,
  };
}

function listen(word: BankWord, opts: BuildOptions): Exercise {
  return {
    key: nextKey(),
    type: 'listen',
    wordId: word.id,
    direction: 'ru-en',
    options: shuffle([{ wordId: word.id, label: word.word }, ...distractors(word, opts.pool, 'ru-en', 3)]),
  };
}

const intro = (word: BankWord): Exercise => ({ key: nextKey(), type: 'intro', wordId: word.id, direction: 'en-ru', isNew: true });
const tiles = (word: BankWord): Exercise => ({ key: nextKey(), type: 'tiles', wordId: word.id, direction: 'ru-en' });
const typed = (word: BankWord): Exercise => ({ key: nextKey(), type: 'type', wordId: word.id, direction: 'ru-en' });

/** Пары для сопоставления: уникальные и слова, и переводы. */
function match(words: BankWord[], opts: BuildOptions, size = 5): Exercise | null {
  const picked: BankWord[] = [];
  const en = new Set<string>();
  const ru = new Set<string>();
  const add = (w: BankWord): void => {
    if (picked.length >= size || en.has(w.id) || ru.has(w.translation.toLowerCase())) return;
    picked.push(w);
    en.add(w.id);
    ru.add(w.translation.toLowerCase());
  };
  words.forEach(add);
  shuffle(opts.pool).forEach(add);
  if (picked.length < 3) return null;
  return { key: nextKey(), type: 'match', wordId: picked[0].id, direction: 'en-ru', pairIds: picked.map((w) => w.id) };
}

/** Задание на воспроизведение: типы чередуются, чтобы урок не был однообразным. */
function production(word: BankWord, turn: number, opts: BuildOptions): Exercise {
  const kinds: Array<'tiles' | 'choice' | 'type' | 'listen'> = ['tiles', 'choice', 'type', 'listen'];
  for (let i = 0; i < kinds.length; i++) {
    const kind = kinds[(turn + i) % kinds.length];
    if (kind === 'tiles' && canTiles(word)) return tiles(word);
    if (kind === 'type' && canType(word)) return typed(word);
    if (kind === 'listen' && opts.listening) return listen(word, opts);
    if (kind === 'choice') return choice(word, 'ru-en', opts);
  }
  return choice(word, 'ru-en', opts);
}

/** Повтор знакомого слова — одно задание случайного типа. */
function recall(word: BankWord, turn: number, opts: BuildOptions): Exercise {
  const variants: Array<() => Exercise> = [
    () => choice(word, 'en-ru', opts),
    () => production(word, turn, opts),
  ];
  if (opts.listening) variants.push(() => listen(word, opts));
  return variants[turn % variants.length]();
}

/**
 * Урок на пути. newWords — слова урока (уже выученные из них
 * не представляются заново), review — знакомые слова для повтора.
 */
export function buildLearnLesson(newWords: BankWord[], review: BankWord[], isKnown: (id: string) => boolean, opts: BuildOptions): Exercise[] {
  const fresh = newWords.filter((w) => !isKnown(w.id));
  const known = newWords.filter((w) => isKnown(w.id));
  const steps: Exercise[] = [];

  // Знакомство парами: intro, intro, проверка, проверка
  for (let i = 0; i < fresh.length; i += 2) {
    const pair = fresh.slice(i, i + 2);
    pair.forEach((w) => steps.push(intro(w)));
    pair.forEach((w, j) => steps.push(opts.listening && (i + j) % 3 === 2 ? listen(w, opts) : choice(w, 'en-ru', opts, true)));
  }

  const matchStep = match(shuffle(newWords), opts, Math.min(5, Math.max(4, newWords.length)));
  if (matchStep) steps.push(matchStep);

  shuffle(fresh).forEach((w, i) => steps.push(production(w, i, opts)));
  [...known, ...review].forEach((w, i) => steps.push(recall(w, i + 1, opts)));

  return steps;
}

/** Повторение юнита («кубок»): без знакомства, больше воспроизведения. */
export function buildReviewLesson(words: BankWord[], opts: BuildOptions, size = 8): Exercise[] {
  const picked = shuffle(words).slice(0, size);
  const steps: Exercise[] = [];
  const first = match(picked.slice(0, 5), opts);
  if (first) steps.push(first);
  picked.forEach((w, i) => steps.push(i % 3 === 0 ? choice(w, 'en-ru', opts) : production(w, i, opts)));
  const second = match(picked.slice(4), opts);
  if (second && picked.length > 6) steps.splice(Math.ceil(steps.length / 2), 0, second);
  return steps;
}

/** Тренировки на вкладке «Практика». */
export function buildPractice(mode: PracticeMode, words: BankWord[], opts: BuildOptions, size = 8): Exercise[] {
  const picked = words.slice(0, size);
  switch (mode) {
    case 'listening':
      return picked.map((w, i) => (i % 3 === 2 && canType(w) ? typed(w) : listen(w, opts)));
    case 'spelling':
      return picked.map((w, i) => (i % 2 === 0 && canTiles(w) ? tiles(w) : canType(w) ? typed(w) : tiles(w)));
    default: {
      const steps = picked.map((w, i) => recall(w, i, opts));
      const m = match(picked.slice(0, 5), opts);
      if (m && picked.length >= 4) steps.splice(Math.min(3, steps.length), 0, m);
      return steps;
    }
  }
}

/** Повтор ошибочного задания в конце урока: те же слова, свежие варианты. */
export function retryOf(ex: Exercise, word: BankWord | undefined, opts: BuildOptions): Exercise {
  if (word && (ex.type === 'choice' || ex.type === 'listen')) {
    const again = ex.type === 'listen' ? listen(word, opts) : choice(word, ex.direction, opts);
    return { ...again, isRetry: true };
  }
  return { ...ex, key: nextKey(), isRetry: true };
}
