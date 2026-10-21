import { afterEach, describe, expect, test } from 'vitest';
import { WORD_BANK } from '@/core/course';
import { createProgress, mergeProgress, sanitizeProgress } from '@/core/progress';
import { learnWord } from '@/core/srs';
import {
  mergeGroups, myWordId, parseGroupFile, sanitizeGroups, serializeGroupFile, syncMyWords, type WordGroup,
} from '@/core/myWords';

const group = (id: string, name: string, words: Array<[string, string]>): WordGroup => ({
  id, name, createdAt: '2026-10-01T00:00:00.000Z', words: words.map(([word, translation]) => ({ word, translation })),
});

afterEach(() => syncMyWords([]));

describe('мои слова', () => {
  test('группы из недоверенных данных: пустые и повторные слова отбрасываются', () => {
    const out = sanitizeGroups([
      { id: 'abc', name: '  Friends  ', words: [{ word: 'Gotcha', translation: 'понял' }, { word: 'gotcha', translation: 'дубль' }, { word: '', translation: 'x' }] },
      'мусор',
      { id: 'abc', words: [] },
    ], '2026-10-01T00:00:00.000Z');
    expect(out).toHaveLength(2);
    expect(out[0].name).toBe('Friends');
    expect(out[0].words).toEqual([{ word: 'Gotcha', translation: 'понял' }]);
    expect(out[1].id).not.toBe('abc');
  });

  test('слова групп попадают в банк и убираются оттуда', () => {
    const size = WORD_BANK.size;
    syncMyWords([group('g1', 'A', [['gotcha', 'понял, ясно']])]);
    expect(WORD_BANK.get(myWordId('Gotcha'))?.translations).toEqual(['понял', 'ясно']);
    syncMyWords([]);
    expect(WORD_BANK.size).toBe(size);
  });

  test('прогресс своего слова сохраняется, только пока слово есть в группе', () => {
    const p = createProgress();
    p.groups = [group('g1', 'A', [['gotcha', 'понял']])];
    p.words[myWordId('gotcha')] = learnWord('2026-10-01');
    p.words[myWordId('ghost')] = learnWord('2026-10-01');
    const clean = sanitizeProgress(JSON.parse(JSON.stringify(p)));
    expect(Object.keys(clean.words)).toEqual([myWordId('gotcha')]);
  });

  test('слияние объединяет группы и слова в них', () => {
    const a = [group('g1', 'A', [['one', 'один']])];
    const b = [group('g1', 'A', [['two', 'два']]), group('g2', 'B', [['three', 'три']])];
    const merged = mergeGroups(a, b);
    expect(merged.map((g) => g.id)).toEqual(['g1', 'g2']);
    expect(merged[0].words.map((w) => w.word)).toEqual(['one', 'two']);

    const p = createProgress();
    p.groups = a;
    const q = createProgress();
    q.groups = b;
    expect(mergeProgress(p, q).groups).toHaveLength(2);
  });

  test('файл группы читается обратно, чужой файл — нет', () => {
    const g = group('g1', 'Friends', [['gotcha', 'понял']]);
    const parsed = parseGroupFile(serializeGroupFile(g));
    expect(parsed).toEqual({ ok: true, name: 'Friends', words: g.words });
    expect(parseGroupFile('[{"word":"cat","translation":"кот"}]').ok).toBe(true);
    expect(parseGroupFile('{"app":"other"}').ok).toBe(false);
    expect(parseGroupFile('not json').ok).toBe(false);
  });
});
