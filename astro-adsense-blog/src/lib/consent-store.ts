/**
 * Shared consent state for advertising and analytics.
 * One state gates BOTH ads and analytics.
 */
export interface ConsentState {
  advertising: boolean;
  analytics: boolean;
  updatedAt: string;
}

type ConsentSubscriber = (state: ConsentState) => void;

const DEFAULT_STATE: ConsentState = {
  advertising: false,
  analytics: false,
  updatedAt: new Date().toISOString(),
};

const STORAGE_KEY = 'consent-state';

let currentState: ConsentState = DEFAULT_STATE;
const subscribers: Set<ConsentSubscriber> = new Set();

/**
 * Gets the current consent state.
 */
export function getConsent(): ConsentState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentState = JSON.parse(stored) as ConsentState;
      }
    } catch {
      // Ignore parse errors, use default
    }
  }
  return { ...currentState };
}

/**
 * Updates the consent state and notifies subscribers.
 */
export function setConsent(state: Partial<Omit<ConsentState, 'updatedAt'>>): void {
  currentState = {
    ...currentState,
    ...state,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch {
      // Ignore storage errors
    }
  }

  for (const subscriber of subscribers) {
    subscriber({ ...currentState });
  }
}

/**
 * Subscribes to consent state changes.
 * Returns an unsubscribe function.
 */
export function subscribeConsent(callback: ConsentSubscriber): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
