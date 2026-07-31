export interface NotificationAdapter { requestPermission(): Promise<boolean>; getToken(): Promise<string | null>; }
export function createFakeNotificationAdapter(): NotificationAdapter { return { async requestPermission() { return true; }, async getToken() { return "fake-fcm-token"; } }; }
