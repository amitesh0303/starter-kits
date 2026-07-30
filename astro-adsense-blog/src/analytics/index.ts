import { getConsent, subscribeConsent } from '../lib/consent-store.js';

let initialized = false;

/**
 * Centralized analytics initializer.
 * Only initializes when consent.analytics === true.
 * Consumes the shared consent store and reacts to state changes.
 */
export function initAnalytics(): void {
  const state = getConsent();

  if (state.analytics && !initialized) {
    activateAnalytics();
  }

  subscribeConsent((newState) => {
    if (newState.analytics && !initialized) {
      activateAnalytics();
    }
  });
}

function activateAnalytics(): void {
  initialized = true;

  // Analytics initialization placeholder.
  // In production, this would load Google Analytics, Plausible, or similar.
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics:initialized'));
  }
}

/**
 * Returns whether analytics has been initialized.
 */
export function isAnalyticsInitialized(): boolean {
  return initialized;
}
