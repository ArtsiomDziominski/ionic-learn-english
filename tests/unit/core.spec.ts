import { describe, expect, test } from 'vitest';
import { addDays, dayKey, daysBetween, plural } from '@/core/dates';
import { LESSON_BY_ID, SECTIONS, TOTAL_WORDS, WORD_BANK, sectionNodeStates, getWord, type BankWord } from '@/core/course';
import {
  createProgress, heartsNow, loseHeart, gainHeart, MAX_HEARTS, HEART_REGEN_MS,
  reconcileStreak, registerActiveDay, sanitizeProgress, mergeProgress, streakFromDays,
} from '@/core/progress';
import { checkTyped } from '@/core/answers';
import { reviewWord, learnWord } from '@/core/srs';
import { generateDailyQuests, applyQuestEvent } from '@/core/quests';
import { migrateLegacy } from '@/core/legacy';
import { buildLearnLesson, buildPractice } from '@/core/lessonBuilder';

describe('курс', () => {
  test('банк слов без дублей', () => {
    expect(TOTAL_WORDS).toBe(WORD_BANK.size);
    expect(TOTAL_WORDS).toBeGreaterThan(1000);
    expect(getWord('you')?.translations.length).toBeGreaterThan(1);
  });

  test('слово попадает только в один уровень', () => {
    const seen = new Set<string>();
    for (const section of SECTIONS.filter((s) => s.kind === 'level')) {
      for (const w of section.words) {
        expect(seen.has(w)).toBe(false);
        seen.add(w);
      }
    }
  });

  test('у каждого юнита есть уроки и итоговое повторение, уроки по 2–5 слов', () => {
    for (const section of SECTIONS) {
      for (const unit of section.units) {
        const lessons = unit.nodes.filter((n) => n.kind === 'lesson');
        expect(lessons.length).toBeGreaterThan(0);
        expect(unit.nodes[unit.nodes.length - 1].kind).toBe('review');
        for (const n of lessons) {
          if (n.kind === 'lesson') {
            expect(n.lesson.words.length).toBeGreaterThanOrEqual(2);
            expect(n.lesson.words.length).toBeLessThanOrEqual(5);
          }
        }
      }
    }
  });

  test('id уроков уникальны и стабильны', () => {
    const ids = SECTIONS.flatMap((s) => s.units.flatMap((u) => u.nodes.map((n) => n.id)));
    expect(new Set(ids).size).toBe(ids.length);
    expect(LESSON_BY_ID.has('a1-u1-l1')).toBe(true);
    expect(LESSON_BY_ID.has('t-airport-1-review')).toBe(true);
  });

  test('в уровне текущий урок один, в темах — по одному на тему', () => {
    const a1 = SECTIONS[0];
    const states = sectionNodeStates(a1, () => false, () => false);
    expect([...states.values()].filter((s) => s === 'current')).toHaveLength(1);
    expect(states.get('a1-u1-l1')).toBe('current');

    const topics = SECTIONS[SECTIONS.length - 1];
    const tStates = sectionNodeStates(topics, () => false, () => false);
    expect([...tStates.values()].filter((s) => s === 'current')).toHaveLength(topics.units.length);
  });
});

describe('даты и серия', () => {
  test('ключ дня локальный и арифметика дней', () => {
    expect(dayKey(new Date(2026, 9, 1, 0, 30))).toBe('2026-10-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(plural(1, 'день', 'дня', 'дней')).toBe('день');
    expect(plural(3, 'день', 'дня', 'дней')).toBe('дня');
    expect(plural(11, 'день', 'дня', 'дней')).toBe('дней');
  });

  test('серия растёт по дням и сгорает после пропуска', () => {
    let s = createProgress().streak;
    s = registerActiveDay(s, '2026-10-01').streak;
    expect(s.current).toBe(1);
    const again = registerActiveDay(s, '2026-10-01');
    expect(again.extended).toBe(false);
    s = registerActiveDay(s, '2026-10-02').streak;
    expect(s.current).toBe(2);
    const lost = reconcileStreak(s, '2026-10-05');
    expect(lost.lost).toBe(true);
    expect(lost.streak.current).toBe(0);
  });

  test('заморозка спасает серию', () => {
    const s = { current: 5, best: 5, lastDay: '2026-10-01', freezes: 2, frozenDays: [] as string[] };
    const r = reconcileStreak(s, '2026-10-03');
    expect(r.lost).toBe(false);
    expect(r.usedFreezes).toBe(1);
    expect(r.streak.freezes).toBe(1);
    expect(registerActiveDay(r.streak, '2026-10-03').streak.current).toBe(6);
  });

  test('серия по набору дней', () => {
    const r = streakFromDays(['2026-09-28', '2026-09-29', '2026-09-30', '2026-09-10'], '2026-10-01');
    expect(r.current).toBe(3);
    expect(r.best).toBe(3);
  });
});

describe('жизни', () => {
  test('теряются и восстанавливаются по таймеру', () => {
    const t0 = 1_000_000;
    let h = { count: MAX_HEARTS, updatedAt: t0 };
    h = loseHeart(h, t0);
    h = loseHeart(h, t0 + 1000);
    expect(heartsNow(h, t0 + 1000)).toBe(MAX_HEARTS - 2);
    expect(heartsNow(h, t0 + HEART_REGEN_MS + 1)).toBe(MAX_HEARTS - 1);
    expect(heartsNow(h, t0 + HEART_REGEN_MS * 10)).toBe(MAX_HEARTS);
    expect(heartsNow(gainHeart(h, t0 + 2000, 5), t0 + 2000)).toBe(MAX_HEARTS);
  });
});

describe('ответы и повторение', () => {
  test('нестрогое сравнение и опечатки', () => {
    expect(checkTyped('  Hello ', ['hello']).verdict).toBe('exact');
    expect(checkTyped('anti lock brakes', ['anti-lock brakes']).verdict).toBe('exact');
    expect(checkTyped('elephnt', ['elephant']).verdict).toBe('typo');
    expect(checkTyped('cat', ['car']).verdict).toBe('wrong');
    expect(checkTyped('', ['car']).verdict).toBe('wrong');
  });

  test('ящики повторения', () => {
    const w = learnWord('2026-10-01');
    expect(w.due).toBe('2026-10-02');
    const later = reviewWord(w, true, '2026-10-02');
    expect(later.strength).toBe(2);
    const wrong = reviewWord(later, false, '2026-10-02');
    expect(wrong.strength).toBe(0);
    expect(wrong.due).toBe('2026-10-02');
  });
});

describe('импорт и слияние', () => {
  test('мусор превращается в пустой прогресс, а не в ошибку', () => {
    const p = sanitizeProgress({ words: { zzzz: {} }, lessons: { nope: {} }, gems: -5, hearts: { count: 99 }, profile: { avatar: 'javascript:alert(1)' } });
    expect(Object.keys(p.words)).toHaveLength(0);
    expect(Object.keys(p.lessons)).toHaveLength(0);
    expect(p.gems).toBe(0);
    expect(p.hearts.count).toBe(MAX_HEARTS);
    expect(p.profile.avatar).toBeNull();
    expect(sanitizeProgress(null).version).toBe(1);
  });

  test('слияние объединяет слова и уроки, счётчики не удваивает', () => {
    const now = new Date(2026, 9, 1, 12);
    const a = createProgress(now);
    const b = createProgress(now);
    a.words.cat = learnWord('2026-09-01');
    b.words.dog = learnWord('2026-09-05');
    a.lessons['a1-u1-l1'] = { completedAt: '2026-09-01', times: 1, bestAccuracy: 80 };
    b.lessons['a1-u1-l1'] = { completedAt: '2026-09-02', times: 3, bestAccuracy: 100 };
    a.xpByDay['2026-09-30'] = 20;
    b.xpByDay['2026-09-30'] = 30;
    b.xpByDay['2026-10-01'] = 10;
    a.xpTotal = 20;
    b.xpTotal = 40;
    const m = mergeProgress(a, b, now);
    expect(Object.keys(m.words).sort()).toEqual(['cat', 'dog']);
    expect(m.lessons['a1-u1-l1']).toEqual({ completedAt: '2026-09-01', times: 3, bestAccuracy: 100 });
    expect(m.xpByDay['2026-09-30']).toBe(30);
    expect(m.xpTotal).toBe(40);
    expect(m.streak.current).toBe(2);
  });
});

describe('миграция со старой версии', () => {
  test('переносит слова, избранное, баллы и засчитывает пройденные уроки', () => {
    const firstLesson = LESSON_BY_ID.get('a1-u1-l1');
    expect(firstLesson).toBeDefined();
    const studied = (firstLesson?.words ?? []).map((id) => ({ word: WORD_BANK.get(id)?.word, translation: 'x', levels: ['A1'] }));
    const store: Record<string, string> = {
      studiedWords: JSON.stringify(studied),
      favoritesWords: JSON.stringify([{ word: 'cat', translation: 'кот', levels: [] }]),
      studyDays: JSON.stringify([{ date: '2026-09-30', completed: true }, { date: '2026-10-01', completed: true }]),
      dailyRepeats: JSON.stringify([{ date: '2026-10-01', repeatCount: 2 }]),
      userPoints: '100',
    };
    const p = migrateLegacy((k) => store[k] ?? null, new Date(2026, 9, 1, 12));
    expect(p).not.toBeNull();
    expect(Object.keys(p?.words ?? {})).toHaveLength(studied.length);
    expect(p?.lessons['a1-u1-l1']).toBeDefined();
    expect(p?.xpByDay['2026-10-01']).toBe(15);
    expect(p?.xpTotal).toBe(100);
    expect(p?.streak.current).toBe(2);
    expect(p?.onboarded).toBe(true);
  });

  test('без старых данных миграции нет', () => {
    expect(migrateLegacy(() => null)).toBeNull();
  });
});

describe('задания и уроки', () => {
  test('задания на день стабильны и считают прогресс', () => {
    const q1 = generateDailyQuests('2026-10-01', true);
    expect(q1).toEqual(generateDailyQuests('2026-10-01', true));
    expect(q1[0].id).toBe('xp');
    const updated = applyQuestEvent(q1, { xp: 1000, lessons: 0, bestCombo: 0, perfect: 0, newWords: 0, practice: 0, listenCorrect: 0 });
    expect(updated[0].progress).toBe(updated[0].target);
    expect(generateDailyQuests('2026-10-01', false).some((q) => q.id === 'listen')).toBe(false);
  });

  test('урок знакомит с новыми словами и даёт верный вариант среди ответов', () => {
    const words = (LESSON_BY_ID.get('a1-u1-l1')?.words ?? []).map((id) => WORD_BANK.get(id) as BankWord);
    const pool = SECTIONS[0].words.map((id) => WORD_BANK.get(id) as BankWord);
    const steps = buildLearnLesson(words, [], () => false, { listening: false, pool });
    expect(steps.filter((s) => s.type === 'intro')).toHaveLength(words.length);
    expect(steps.some((s) => s.type === 'listen')).toBe(false);
    for (const s of steps) {
      if (s.options) {
        expect(s.options.some((o) => o.wordId === s.wordId)).toBe(true);
        expect(new Set(s.options.map((o) => o.label)).size).toBe(s.options.length);
      }
    }
    const practice = buildPractice('listening', words, { listening: true, pool });
    expect(practice.length).toBe(words.length);
  });
});
