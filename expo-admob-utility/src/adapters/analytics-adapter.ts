/**
 * Firebase Analytics adapter with fake implementation.
 */

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number>;
}

export interface AnalyticsAdapter {
  logEvent(event: AnalyticsEvent): Promise<void>;
  setUserId(userId: string | null): Promise<void>;
}

export function createFakeAnalyticsAdapter(): AnalyticsAdapter {
  const events: AnalyticsEvent[] = [];

  return {
    async logEvent(event: AnalyticsEvent): Promise<void> {
      events.push(event);
    },
    async setUserId(_userId: string | null): Promise<void> {
      // Fake: no-op
    },
  };
}
