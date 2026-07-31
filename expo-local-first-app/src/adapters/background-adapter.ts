export interface BackgroundAdapter { registerSyncTask(): Promise<boolean>; unregisterSyncTask(): Promise<void>; isRegistered(): Promise<boolean>; }
export function createFakeBackgroundAdapter(): BackgroundAdapter {
  let registered = false;
  return { async registerSyncTask() { registered = true; return true; }, async unregisterSyncTask() { registered = false; }, async isRegistered() { return registered; } };
}
