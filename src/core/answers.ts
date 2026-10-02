/**
 * Проверка набранного ответа.
 *
 * Сравнение снисходительное, как в Duolingo: регистр, лишние
 * пробелы, апострофы и дефисы не важны, а одна-две опечатки в
 * длинном слове засчитываются с подсказкой «Почти! Опечатка».
 */

export type AnswerVerdict = 'exact' | 'typo' | 'wrong';

export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/ё/g, 'е')
    .replace(/[.,!?;:"«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Без дефисов и пробелов: «anti-lock» = «anti lock» = «antilock». */
const compact = (text: string): string => normalizeAnswer(text).replace(/[-\s]/g, '');

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Сколько опечаток прощаем: в коротких словах опечатка меняет слово. */
const allowedTypos = (length: number): number => (length >= 10 ? 2 : length >= 5 ? 1 : 0);

export function checkTyped(input: string, accepted: string[]): { verdict: AnswerVerdict; matched: string } {
  const typed = compact(input);
  if (!typed) return { verdict: 'wrong', matched: accepted[0] ?? '' };

  for (const answer of accepted) {
    if (compact(answer) === typed) return { verdict: 'exact', matched: answer };
  }
  for (const answer of accepted) {
    const target = compact(answer);
    const limit = allowedTypos(target.length);
    if (limit && levenshtein(typed, target) <= limit) return { verdict: 'typo', matched: answer };
  }
  return { verdict: 'wrong', matched: accepted[0] ?? '' };
}
