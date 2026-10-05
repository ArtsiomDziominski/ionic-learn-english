import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { trackEvent } from '@/utils/analytics';
import { useLessonStore } from '@/store/lesson';
import { useProgressStore } from '@/store/progress';
import { useSettingsStore } from '@/store/settings';

type Call = [string, string, Record<string, string | number>];

const gtag = vi.fn();
const events = (name?: string): Call[] =>
  (gtag.mock.calls as Call[]).filter((c) => c[0] === 'event' && (!name || c[1] === name));

beforeEach(() => {
  localStorage.clear();
  gtag.mockReset();
  window.gtag = gtag;
  setActivePinia(createPinia());
});

afterEach(() => {
  delete window.gtag;
});

describe('trackEvent', () => {
  test('отправляет событие в gtag, булевы значения превращает в строки', () => {
    trackEvent('demo', { flag: true, count: 3, name: 'x', skipped: undefined });
    expect(gtag).toHaveBeenCalledWith('event', 'demo', { flag: 'true', count: 3, name: 'x' });
  });

  test('без gtag (блокировщик, тесты) ничего не падает', () => {
    delete window.gtag;
    expect(() => trackEvent('demo')).not.toThrow();
  });

  test('ошибка внутри gtag не пробрасывается', () => {
    window.gtag = () => {
      throw new Error('blocked');
    };
    expect(() => trackEvent('demo')).not.toThrow();
  });
});

/** Проходит урок без единой ошибки. */
function playPerfect(lesson: ReturnType<typeof useLessonStore>): void {
  let guard = 200;
  while (lesson.current && lesson.phase !== 'finished' && guard-- > 0) {
    if (lesson.current.type === 'intro') {
      lesson.acknowledgeIntro();
    } else {
      lesson.submit({ correct: true });
      lesson.proceed();
    }
  }
}

describe('события урока', () => {
  test('lesson_start → answer → lesson_complete', () => {
    const lesson = useLessonStore();
    expect(lesson.startPathLesson('a1-u1-l1')).toBe(true);
    expect(events('lesson_start')).toHaveLength(1);
    expect(events('lesson_start')[0][2]).toEqual({ lesson_type: 'path', lesson_id: 'a1-u1-l1' });

    playPerfect(lesson);

    const answers = events('answer');
    expect(answers.length).toBeGreaterThan(0);
    expect(answers.every((c) => c[2].correct === 'true' && typeof c[2].exercise === 'string')).toBe(true);

    const done = events('lesson_complete');
    expect(done).toHaveLength(1);
    expect(done[0][2]).toMatchObject({ lesson_type: 'path', lesson_id: 'a1-u1-l1', accuracy: 100, perfect: 'true', first_completion: 'true' });
    expect(typeof done[0][2].xp).toBe('number');
    // первый урок продлевает серию и приносит достижение «Прилежный ученик»
    expect(events('unlock_achievement').length).toBeGreaterThan(0);
    expect(events('lesson_abandon')).toHaveLength(0);
  });

  test('ошибка попадает в answer с correct=false', () => {
    const lesson = useLessonStore();
    lesson.startPathLesson('a1-u1-l1');
    while (lesson.current?.type === 'intro') lesson.acknowledgeIntro();
    lesson.submit({ correct: false });
    expect(events('answer').at(-1)?.[2]).toEqual({ exercise: lesson.current?.type, correct: 'false' });
  });

  test('lesson_abandon уходит один раз, даже если выход вызвали дважды', () => {
    const lesson = useLessonStore();
    lesson.startPathLesson('a1-u1-l1');
    lesson.abandon('quit');
    lesson.abandon('left');
    const abandoned = events('lesson_abandon');
    expect(abandoned).toHaveLength(1);
    expect(abandoned[0][2]).toMatchObject({ lesson_type: 'path', lesson_id: 'a1-u1-l1', reason: 'quit', progress: 0 });
  });

  test('законченный урок не считается брошенным', () => {
    const lesson = useLessonStore();
    lesson.startPathLesson('a1-u1-l1');
    playPerfect(lesson);
    lesson.abandon('quit');
    expect(events('lesson_abandon')).toHaveLength(0);
  });

  test('тренировка помечается режимом', () => {
    const progress = useProgressStore();
    const lesson = useLessonStore();
    // тренировке нужны выученные слова
    lesson.startPathLesson('a1-u1-l1');
    playPerfect(lesson);
    lesson.reset();
    gtag.mockReset();
    expect(progress.learnedCount).toBeGreaterThan(0);
    // слов может не хватить — тогда урок не стартует и события нет
    const started = lesson.startPractice('quick');
    expect(events('lesson_start')).toHaveLength(started ? 1 : 0);
    if (started) expect(events('lesson_start')[0][2]).toEqual({ lesson_type: 'practice', mode: 'quick' });
  });
});

describe('прочие события', () => {
  test('смена настройки отправляется только при реальной смене', () => {
    const settings = useSettingsStore();
    settings.update('theme', 'dark');
    settings.update('theme', 'dark');
    const changes = events('setting_change');
    expect(changes).toHaveLength(1);
    expect(changes[0][2]).toEqual({ setting: 'theme', setting_value: 'dark' });
  });

  test('название голоса не уходит в аналитику', () => {
    const settings = useSettingsStore();
    settings.update('voiceURI', 'Some Long Voice Name');
    expect(events('setting_change')[0][2]).toEqual({ setting: 'voiceURI', setting_value: 'custom' });
  });

  test('знакомство, цель, избранное и сброс', () => {
    const progress = useProgressStore();
    progress.completeOnboarding({ goal: 30, sectionId: 'a2' });
    expect(events('tutorial_complete')[0][2]).toEqual({ goal: 30, section: 'a2' });

    progress.setDailyGoal(50);
    expect(events('daily_goal_change')[0][2]).toEqual({ goal: 50 });

    progress.toggleFavorite('you');
    progress.toggleFavorite('you');
    expect(events('favorite_toggle').map((c) => c[2].action)).toEqual(['add', 'remove']);

    progress.resetAll();
    expect(events('progress_reset')).toHaveLength(1);
  });

  test('покупка жизней и заморозки не отправляется, если не хватает кристаллов', () => {
    const progress = useProgressStore();
    progress.state.gems = 0;
    expect(progress.refillHearts()).toBe(false);
    expect(progress.buyFreeze()).toBe(false);
    expect(events('shop_purchase')).toHaveLength(0);
  });
});
