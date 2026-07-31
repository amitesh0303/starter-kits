export interface HealthAdapter { getSteps(date: string): Promise<number>; getHeartRate(): Promise<number | null>; getSleepHours(date: string): Promise<number>; isAvailable(): Promise<boolean>; }
export function createFakeHealthAdapter(): HealthAdapter {
  return { async getSteps(_d) { return 8500; }, async getHeartRate() { return 72; }, async getSleepHours(_d) { return 7.5; }, async isAvailable() { return true; } };
}
