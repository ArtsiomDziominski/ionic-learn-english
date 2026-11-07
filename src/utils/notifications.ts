/**
 * Локальные уведомления (только в приложении, не в браузере).
 * Пока приложение открыто, уведомления сняты; когда уходит в фон —
 * ставятся заново по planNotifications().
 */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { HEARTS_ID, REMINDER_ID, type PlannedNotification } from '@/core/reminders';
import { getStorageItem, setStorageItem } from '@/utils/util';

const CHANNEL_ID = 'reminders';
const ASKED_KEY = 'slovaday.notifications.asked';
const native = Capacitor.isNativePlatform();

let channelReady = false;
async function ensureChannel(): Promise<void> {
  if (channelReady || Capacitor.getPlatform() !== 'android') return;
  await LocalNotifications.createChannel({
    id: CHANNEL_ID,
    name: 'Напоминания',
    description: 'Напоминание об уроке и восстановлении жизней',
    importance: 3,
  });
  channelReady = true;
}

export async function notificationsGranted(): Promise<boolean> {
  if (!native) return false;
  try {
    return (await LocalNotifications.checkPermissions()).display === 'granted';
  } catch {
    return false;
  }
}

/** Спросить разрешение. force — по нажатию пользователя в настройках. */
export async function requestNotifications(force = false): Promise<boolean> {
  if (!native) return false;
  try {
    const { display } = await LocalNotifications.checkPermissions();
    if (display === 'granted') return true;
    if (display === 'denied' || (!force && getStorageItem(ASKED_KEY))) return false;
    setStorageItem(ASKED_KEY, '1');
    return (await LocalNotifications.requestPermissions()).display === 'granted';
  } catch {
    return false;
  }
}

export async function cancelNotifications(): Promise<void> {
  if (!native) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }, { id: HEARTS_ID }] });
  } catch {
    /* нечего отменять */
  }
}

export async function scheduleNotifications(list: PlannedNotification[]): Promise<void> {
  if (!native) return;
  try {
    await cancelNotifications();
    if (!list.length || !(await notificationsGranted())) return;
    await ensureChannel();
    await LocalNotifications.schedule({
      notifications: list
        .filter((n) => n.at.getTime() > Date.now())
        .map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: { at: n.at, allowWhileIdle: true },
          channelId: CHANNEL_ID,
        })),
    });
  } catch (error) {
    console.warn('Не удалось запланировать уведомления', error);
  }
}
