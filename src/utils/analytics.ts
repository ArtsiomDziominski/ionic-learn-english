/**
 * Кастомные события Google Analytics 4.
 *
 * Сам тег gtag.js подключён в index.html. Здесь только тонкая обёртка:
 * блокировщик рекламы, отсутствие сети или prerender в Node не должны
 * ронять приложение, поэтому любая ошибка глотается.
 *
 * События (имя → параметры):
 *   lesson_start     flow                       начало урока
 *   answer           exercise, correct          ответ в упражнении
 *   lesson_complete  flow, points               урок пройден до конца
 *   lesson_continue  flow                       «Продолжить» на экране итога
 *   lesson_exit      flow                       «Выйти» на экране итога
 *   lesson_abandon   exercise, progress         ушёл из урока, не закончив
 *   favorite_toggle  action (add | remove)      слово в избранном
 *   article_view     article_id, article_title  открыта статья
 *   theme_change     theme                      смена темы оформления
 */

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (name: string, params: EventParams = {}): void => {
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* аналитика не должна влиять на работу приложения */
  }
};

/** exercise — значение ViewCardWords: Card, List, Words или Match. */
export const trackAnswer = (exercise: string, correct: boolean): void => {
  trackEvent('answer', { exercise, correct });
};
