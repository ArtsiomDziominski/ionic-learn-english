import { describe, expect, it } from 'vitest';
import { HEARTS_ID, REMINDER_ID, outsideQuietHours, planNotifications } from '@/core/reminders';
import { HEART_REGEN_MS, MAX_HEARTS } from '@/core/progress';

const at = (h: number, m = 0) => new Date(2026, 10, 6, h, m);

describe('planNotifications', () => {
  it('одно напоминание — завтра в 19:00', () => {
    const list = planNotifications({ now: at(10), hearts: { count: MAX_HEARTS, updatedAt: 0 }, heartsEnabled: true, streak: 0 });
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(REMINDER_ID);
    expect(list[0].at).toEqual(new Date(2026, 10, 7, 19, 0));
  });

  it('жизни: уведомление, только если их мало', () => {
    const now = at(12);
    const one = planNotifications({ now, hearts: { count: 4, updatedAt: now.getTime() }, heartsEnabled: true, streak: 3 });
    expect(one.find((n) => n.id === HEARTS_ID)).toBeUndefined();

    const low = planNotifications({ now, hearts: { count: 0, updatedAt: now.getTime() }, heartsEnabled: true, streak: 3 });
    const h = low.find((n) => n.id === HEARTS_ID);
    expect(h?.at.getTime()).toBe(now.getTime() + MAX_HEARTS * HEART_REGEN_MS);
  });

  it('жизни выключены — уведомления о них нет', () => {
    const now = at(12);
    const list = planNotifications({ now, hearts: { count: 0, updatedAt: now.getTime() }, heartsEnabled: false, streak: 0 });
    expect(list.map((n) => n.id)).toEqual([REMINDER_ID]);
  });

  it('ночью не будим', () => {
    expect(outsideQuietHours(at(23, 30))).toEqual(new Date(2026, 10, 7, 9, 0));
    expect(outsideQuietHours(at(3))).toEqual(at(9));
    expect(outsideQuietHours(at(15))).toEqual(at(15));
  });
});
