import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Тактильный отклик.
 *
 * Плагин работает только в нативной сборке, в браузере его вызовы
 * отклоняются промисом. Поэтому каждый вызов закрыт проверкой
 * платформы и catch: отсутствие вибромотора или отключённая в
 * системе тактильная отдача не должны ронять урок.
 */

const isAvailable = (): boolean => Capacitor.isNativePlatform();

/** Верный ответ — короткий утвердительный отклик. */
export const hapticSuccess = async (): Promise<void> => {
  if (!isAvailable()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* устройство без вибромотора или отдача выключена в системе */
  }
};

/** Неверный ответ — более заметный отклик. */
export const hapticError = async (): Promise<void> => {
  if (!isAvailable()) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch {
    /* см. выше */
  }
};

/** Нажатие на карточку или клавишу — лёгкий щелчок. */
export const hapticTap = async (): Promise<void> => {
  if (!isAvailable()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* см. выше */
  }
};
