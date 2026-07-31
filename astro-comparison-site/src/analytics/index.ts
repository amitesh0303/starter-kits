import { loadConfig } from '../lib/config.js';

let initialized = false;

export function initAnalytics(): void {
  const config = loadConfig();
  if (!config.isAnalyticsEnabled) return;
  if (initialized) return;

  initialized = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics:initialized'));
  }
}

export function isAnalyticsInitialized(): boolean {
  return initialized;
}
