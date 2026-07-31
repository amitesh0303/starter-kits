let initialized = false;

export function initAnalytics(): void {
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!analyticsId || analyticsId === "G-XXXXXXXXXX") return;
  if (initialized) return;

  initialized = true;
}

export function trackToolUsage(toolSlug: string): void {
  if (!initialized) return;
  // In production: send event to analytics provider
}

export function isAnalyticsInitialized(): boolean {
  return initialized;
}
