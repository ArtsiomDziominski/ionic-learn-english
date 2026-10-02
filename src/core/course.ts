/**
 * Курс: из плоского словаря строится путь как в Duolingo —
 * разделы (уровни A1–C2 и «Темы») → юниты → уроки.
 *
 * В исходных данных одно слово часто повторяется в нескольких
 * уровнях («you» есть и в A1, и в A2), из 1456 записей уникальных
 * слов 1112. Поэтому сначала собирается банк уникальных слов,
 * а в разделы-уровни слово попадает один раз — в самый ранний.
 *
 * Идентификаторы юнитов и уроков стабильны (не зависят от
 * случайности) — на них ссылается сохранённый и экспортированный
 * прогресс.
 */
import { words as RAW_WORDS } from '@/content/words_level';

export const LESSON_SIZE = 4;
export const LESSONS_PER_UNIT = 6;

export interface BankWord {
  /** Ключ — английское слово в нижнем регистре. */
  id: string;
  word: string;
  /** Все известные переводы; первый — основной. */
  translations: string[];
  translation: string;
  tags: string[];
}

export interface UnitPalette {
  main: string;
  shade: string;
  soft: string;
}

/** Цвета юнитов чередуются, как разделы на пути Duolingo. */
export const UNIT_PALETTES: UnitPalette[] = [
  { main: '#58CC02', shade: '#46A302', soft: '#D7FFB8' },
  { main: '#7C5CFF', shade: '#5B3BE0', soft: '#E6E0FF' },
  { main: '#1CB0F6', shade: '#1590CC', soft: '#DDF4FF' },
  { main: '#FF6FB5', shade: '#DE4F96', soft: '#FFE3F1' },
  { main: '#FF9600', shade: '#D97F00', soft: '#FFEFD6' },
  { main: '#00C2A8', shade: '#009E89', soft: '#D3FBF4' },
  { main: '#FF4B4B', shade: '#E02E2E', soft: '#FFE1E1' },
];

export type LessonKind = 'learn' | 'review';

export interface CourseLesson {
  id: string;
  kind: LessonKind;
  unitId: string;
  sectionId: string;
  /** Номер урока в юните, с нуля. */
  index: number;
  words: string[];
}

export type PathNode =
  | { kind: 'lesson'; id: string; lesson: CourseLesson }
  | { kind: 'chest'; id: string }
  | { kind: 'review'; id: string; lesson: CourseLesson };

export interface CourseUnit {
  id: string;
  sectionId: string;
  /** Номер юнита в разделе, с единицы. */
  number: number;
  title: string;
  subtitle: string;
  palette: UnitPalette;
  words: string[];
  nodes: PathNode[];
  topic?: string;
}

export type SectionKind = 'level' | 'topics';

export interface CourseSection {
  id: string;
  kind: SectionKind;
  /** Номер раздела для подписи «Раздел 2». */
  number: number;
  badge: string;
  title: string;
  english: string;
  subtitle: string;
  units: CourseUnit[];
  words: string[];
}

interface LevelMeta {
  key: string;
  title: string;
  english: string;
  subtitle: string;
}

const LEVELS: LevelMeta[] = [
  { key: 'A1', title: 'Начальный', english: 'Beginner', subtitle: 'Основы английского языка' },
  { key: 'A2', title: 'Элементарный', english: 'Elementary', subtitle: 'Простые диалоги и фразы' },
  { key: 'B1', title: 'Средний', english: 'Intermediate', subtitle: 'Уверенное общение' },
  { key: 'B2', title: 'Выше среднего', english: 'Upper-Intermediate', subtitle: 'Продвинутое общение' },
  { key: 'C1', title: 'Продвинутый', english: 'Advanced', subtitle: 'Профессиональный уровень' },
  { key: 'C2', title: 'В совершенстве', english: 'Proficiency', subtitle: 'Уровень носителя' },
];

export interface TopicMeta {
  key: string;
  title: string;
  subtitle: string;
}

export const TOPICS: TopicMeta[] = [
  { key: 'pronoun', title: 'Местоимения', subtitle: 'Личные и указательные' },
  { key: 'number', title: 'Числа', subtitle: 'От нуля до миллиарда' },
  { key: 'home', title: 'Дом и быт', subtitle: 'Семья, вещи, повседневность' },
  { key: 'food', title: 'Еда и напитки', subtitle: 'Рестораны и кулинария' },
  { key: 'health', title: 'Здоровье', subtitle: 'Симптомы, лечение, врачи' },
  { key: 'journey', title: 'Путешествия', subtitle: 'Дорога и транспорт' },
  { key: 'tourism', title: 'Туризм', subtitle: 'Отели, экскурсии, достопримечательности' },
  { key: 'airport', title: 'Аэропорт', subtitle: 'Регистрация, таможня, багаж' },
  { key: 'auto', title: 'Автомобили', subtitle: 'Устройство машины и дорога' },
  { key: 'business', title: 'Бизнес', subtitle: 'Офис, переговоры, финансы' },
  { key: 'science', title: 'Наука', subtitle: 'Технологии и исследования' },
  { key: 'culture', title: 'Культура', subtitle: 'Искусство, музыка, театр' },
  { key: 'fitness', title: 'Спорт', subtitle: 'Тренировки и здоровье' },
  { key: 'fashion', title: 'Мода', subtitle: 'Одежда, стиль, покупки' },
  { key: 'ecology', title: 'Экология', subtitle: 'Природа и климат' },
  { key: 'government', title: 'Государство', subtitle: 'Политика и управление' },
  { key: 'socialissues', title: 'Общество', subtitle: 'Права и социальные вопросы' },
];

/* ——— Банк слов ——————————————————————————————————————————— */

/** «ты, вы» → ['ты', 'вы']: значения храним по отдельности, без повторов. */
const meanings = (translation: string): string[] =>
  translation.split(/[,;]/).map((t) => t.trim()).filter(Boolean);

function buildBank(): Map<string, BankWord> {
  const bank = new Map<string, BankWord>();
  for (const raw of RAW_WORDS) {
    const id = raw.word.trim().toLowerCase();
    if (!id) continue;
    const existing = bank.get(id);
    if (existing) {
      for (const m of meanings(raw.translation)) if (!existing.translations.includes(m)) existing.translations.push(m);
      for (const tag of raw.levels) if (!existing.tags.includes(tag)) existing.tags.push(tag);
      continue;
    }
    bank.set(id, {
      id,
      word: raw.word.trim(),
      translations: meanings(raw.translation),
      translation: raw.translation.trim(),
      tags: [...raw.levels],
    });
  }
  return bank;
}

export const WORD_BANK: Map<string, BankWord> = buildBank();
export const ALL_WORD_IDS: string[] = [...WORD_BANK.keys()];
export const TOTAL_WORDS = WORD_BANK.size;

export function getWord(id: string): BankWord | undefined {
  return WORD_BANK.get(id);
}

/* ——— Разделы, юниты, уроки ——————————————————————————————— */

const chunk = <T>(list: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

/** Делит уроки на юниты; хвост из одного урока присоединяется к предыдущему. */
function splitIntoUnits(lessons: string[][], perUnit: number): string[][][] {
  const units = chunk(lessons, perUnit);
  if (units.length > 1 && units[units.length - 1].length < 2) {
    const tail = units.pop() as string[][];
    units[units.length - 1].push(...tail);
  }
  return units;
}

/** Слова урока — по 4; маленький хвост (1 слово) уходит в предыдущий урок. */
function splitIntoLessons(words: string[]): string[][] {
  const lessons = chunk(words, LESSON_SIZE);
  if (lessons.length > 1 && lessons[lessons.length - 1].length < 2) {
    const tail = lessons.pop() as string[];
    lessons[lessons.length - 1].push(...tail);
  }
  return lessons;
}

function buildNodes(unitId: string, sectionId: string, lessonWords: string[][], allWords: string[]): PathNode[] {
  const nodes: PathNode[] = [];
  const chestAfter = Math.max(1, Math.floor(lessonWords.length / 2));
  lessonWords.forEach((words, index) => {
    const lesson: CourseLesson = { id: `${unitId}-l${index + 1}`, kind: 'learn', unitId, sectionId, index, words };
    nodes.push({ kind: 'lesson', id: lesson.id, lesson });
    if (index + 1 === chestAfter && lessonWords.length > 2) nodes.push({ kind: 'chest', id: `${unitId}-chest` });
  });
  const review: CourseLesson = {
    id: `${unitId}-review`,
    kind: 'review',
    unitId,
    sectionId,
    index: lessonWords.length,
    words: allWords,
  };
  nodes.push({ kind: 'review', id: review.id, lesson: review });
  return nodes;
}

const sampleWords = (ids: string[], n = 3): string =>
  ids.slice(0, n).map((id) => WORD_BANK.get(id)?.word ?? id).join(', ') + (ids.length > n ? '…' : '');

function buildLevelSections(): CourseSection[] {
  const taken = new Set<string>();
  let paletteIndex = 0;

  return LEVELS.map((meta, sectionIndex) => {
    const sectionId = meta.key.toLowerCase();
    const sectionWords: string[] = [];
    for (const raw of RAW_WORDS) {
      if (!raw.levels.includes(meta.key)) continue;
      const id = raw.word.trim().toLowerCase();
      if (taken.has(id)) continue;
      taken.add(id);
      sectionWords.push(id);
    }

    const units = splitIntoUnits(splitIntoLessons(sectionWords), LESSONS_PER_UNIT).map((lessonWords, unitIndex) => {
      const id = `${sectionId}-u${unitIndex + 1}`;
      const words = lessonWords.flat();
      const unit: CourseUnit = {
        id,
        sectionId,
        number: unitIndex + 1,
        title: `Юнит ${unitIndex + 1}`,
        subtitle: sampleWords(words),
        palette: UNIT_PALETTES[paletteIndex++ % UNIT_PALETTES.length],
        words,
        nodes: buildNodes(id, sectionId, lessonWords, words),
      };
      return unit;
    });

    return {
      id: sectionId,
      kind: 'level' as const,
      number: sectionIndex + 1,
      badge: meta.key,
      title: meta.title,
      english: meta.english,
      subtitle: meta.subtitle,
      units,
      words: sectionWords,
    };
  });
}

function buildTopicSection(number: number): CourseSection {
  const units: CourseUnit[] = [];
  const allWords: string[] = [];
  let paletteIndex = 1;

  for (const topic of TOPICS) {
    const words: string[] = [];
    for (const raw of RAW_WORDS) {
      if (!raw.levels.includes(topic.key)) continue;
      const id = raw.word.trim().toLowerCase();
      if (!words.includes(id)) words.push(id);
    }
    if (!words.length) continue;
    allWords.push(...words.filter((w) => !allWords.includes(w)));

    const lessons = splitIntoLessons(words);
    // Большие темы делим на равные части, чтобы юнит не тянулся на 16 уроков
    const parts = Math.ceil(lessons.length / LESSONS_PER_UNIT);
    const perPart = Math.ceil(lessons.length / parts);
    const groups = chunk(lessons, perPart);

    groups.forEach((lessonWords, partIndex) => {
      const id = `t-${topic.key}-${partIndex + 1}`;
      const unitWords = lessonWords.flat();
      units.push({
        id,
        sectionId: 'topics',
        number: units.length + 1,
        title: groups.length > 1 ? `${topic.title} · часть ${partIndex + 1}` : topic.title,
        subtitle: topic.subtitle,
        palette: UNIT_PALETTES[paletteIndex++ % UNIT_PALETTES.length],
        words: unitWords,
        nodes: buildNodes(id, 'topics', lessonWords, unitWords),
        topic: topic.key,
      });
    });
  }

  return {
    id: 'topics',
    kind: 'topics',
    number,
    badge: 'Темы',
    title: 'Темы',
    english: 'Topics',
    subtitle: 'Слова для конкретных ситуаций',
    units,
    words: allWords,
  };
}

const LEVEL_SECTIONS = buildLevelSections();

export const SECTIONS: CourseSection[] = [...LEVEL_SECTIONS, buildTopicSection(LEVEL_SECTIONS.length + 1)];

export const DEFAULT_SECTION_ID = 'a1';

/* ——— Индексы для быстрого поиска ————————————————————————— */

export const SECTION_BY_ID = new Map(SECTIONS.map((s) => [s.id, s]));
export const UNIT_BY_ID = new Map(SECTIONS.flatMap((s) => s.units.map((u) => [u.id, u] as const)));
export const LESSON_BY_ID = new Map<string, CourseLesson>();
export const CHEST_IDS = new Set<string>();

for (const section of SECTIONS) {
  for (const unit of section.units) {
    for (const node of unit.nodes) {
      if (node.kind === 'chest') CHEST_IDS.add(node.id);
      else LESSON_BY_ID.set(node.id, node.lesson);
    }
  }
}

export function getSection(id: string | undefined): CourseSection {
  return (id && SECTION_BY_ID.get(id)) || SECTIONS[0];
}

/* ——— Состояние пути ——————————————————————————————————————— */

export type NodeState = 'done' | 'current' | 'open' | 'locked';

export interface PathNodeView {
  node: PathNode;
  unit: CourseUnit;
  state: NodeState;
}

/**
 * Состояния узлов раздела. В уровнях уроки идут строго по порядку
 * через все юниты; в «Темах» каждая тема — отдельная дорожка, и
 * начинать можно с любой.
 */
export function sectionNodeStates(
  section: CourseSection,
  isLessonDone: (id: string) => boolean,
  isChestOpen: (id: string) => boolean,
): Map<string, NodeState> {
  const states = new Map<string, NodeState>();
  const perUnit = section.kind === 'topics';
  let blocked = false;
  let currentSet = false;

  for (const unit of section.units) {
    if (perUnit) {
      blocked = false;
    }
    let unitCurrentSet = false;
    for (const node of unit.nodes) {
      if (node.kind === 'chest') {
        states.set(node.id, isChestOpen(node.id) ? 'done' : blocked ? 'locked' : 'open');
        continue;
      }
      if (isLessonDone(node.id)) {
        states.set(node.id, 'done');
        continue;
      }
      if (blocked) {
        states.set(node.id, 'locked');
        continue;
      }
      const isCurrent = perUnit ? !unitCurrentSet : !currentSet;
      states.set(node.id, isCurrent ? 'current' : 'locked');
      if (perUnit) unitCurrentSet = true;
      else currentSet = true;
      blocked = true;
    }
  }
  return states;
}

/** Первый непройденный урок раздела — куда ведёт кнопка «Продолжить». */
export function firstOpenLesson(section: CourseSection, isLessonDone: (id: string) => boolean): CourseLesson | null {
  for (const unit of section.units) {
    for (const node of unit.nodes) {
      if (node.kind !== 'chest' && !isLessonDone(node.id)) return node.lesson;
    }
  }
  return null;
}

export function sectionLessonIds(section: CourseSection): string[] {
  return section.units.flatMap((u) => u.nodes.filter((n) => n.kind !== 'chest').map((n) => n.id));
}

export function unitLessonIds(unit: CourseUnit): string[] {
  return unit.nodes.filter((n) => n.kind !== 'chest').map((n) => n.id);
}
