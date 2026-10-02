import { Capacitor } from '@capacitor/core';
import { Style, StatusBar } from '@capacitor/status-bar';

/**
 * Окраска системного статус-бара под текущую тему.
 *
 * Значения цветов продублированы из --bg в theme/variables.css:
 * плагин принимает строку, а не CSS-переменную, поэтому при смене
 * палитры их нужно поправить и здесь.
 */
const BAR_BACKGROUND = {
  dark: '#131022',
  light: '#FFFFFF',
};

export const applyStatusBarTheme = async (isDark: boolean): Promise<void> => {
  // В браузере плагина нет, вызовы отклоняются промисом
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Style.Dark — светлые значки для тёмного фона, Style.Light — наоборот
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
  } catch {
    /* плагин недоступен — оставляем системное оформление */
  }

  try {
    // Только Android; на iOS метод не поддерживается и бросает ошибку
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({
        color: isDark ? BAR_BACKGROUND.dark : BAR_BACKGROUND.light,
      });
    }
  } catch {
    /* см. выше */
  }
};
