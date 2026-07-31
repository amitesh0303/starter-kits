export interface NotificationAdapter { requestPermission(): Promise<boolean>; getToken(): Promise<string | null>; sendLocal(title: string, body: string): Promise<void>; }
export function createFakeNotificationAdapter(): NotificationAdapter {
  return { async requestPermission() { return true; }, async getToken() { return "fake-token"; }, async sendLocal(_t, _b) {} };
}
