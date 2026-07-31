export interface NotificationAdapter { requestPermission(): Promise<boolean>; scheduleReminder(eventTitle: string, date: string): Promise<void>; }
export function createFakeNotificationAdapter(): NotificationAdapter {
  return { async requestPermission() { return true; }, async scheduleReminder(_t, _d) {} };
}
