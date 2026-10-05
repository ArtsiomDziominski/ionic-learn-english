/**
 * Кастомные события Google Analytics 4.
 *
 * Сам тег gtag.js подключён в index.html. Здесь только тонкая обёртка:
 * блокировщик рекламы, отсутствие сети или запуск в Node (тесты) не
 * должны ронять приложение, поэтому любая ошибка глотается.
 *
 * Имена параметров выбраны так, чтобы не пересекаться с зарезервированными
 * в GA4 (source, medium, value, language, platform и т. п.).
 *
 * События (имя → параметры):
 *
 *   Уроки
 *   lesson_start        lesson_type (path|practice), lesson_id | mode
 *   answer              exercise (тип задания), correct
 *   lesson_complete     lesson_type, lesson_id | mode, xp, accuracy, perfect,
 *                       first_completion, new_words, duration_s, streak
 *   lesson_abandon      lesson_type, lesson_id | mode, progress (%), mistakes,
 *                       reason (quit | out_of_hearts | left)
 *   out_of_hearts       place (path — не дали начать, lesson — кончились в уроке)
 *
 *   Награды и цели
 *   daily_goal_reached  xp_goal
 *   unlock_achievement  achievement_id, tier
 *   quest_claim         quest, gems
 *   chest_open          amount
 *   shop_purchase       item (hearts | streak_freeze), cost
 *
 *   Знакомство
 *   tutorial_begin
 *   tutorial_step       step (1..3)
 *   tutorial_complete   goal, section
 *
 *   Навигация и настройки
 *   panel_open          panel (section | streak | gems | hearts | quests | words)
 *   section_change      section
 *   daily_goal_change   goal
 *   favorite_toggle     action (add | remove)
 *   setting_change      setting, setting_value
 *   article_view        article_id, article_title
 *
 *   Перенос прогресса
 *   progress_export     kind (save | send), outcome
 *   progress_import     mode (merge | replace)
 *   progress_reset
 *   share               content_type (progress_card), method (outcome)
 */

type ParamValue = string | number | boolean;
type EventParams = Record<string, ParamValue | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackEvent = (name: string, params: EventParams = {}): void => {
  try {
    const clean: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      // GA4 принимает только строки и числа
      clean[key] = typeof value === 'boolean' ? String(value) : value;
    }
    window.gtag?.('event', name, clean);
  } catch {
    /* аналитика не должна влиять на работу приложения */
  }
};
