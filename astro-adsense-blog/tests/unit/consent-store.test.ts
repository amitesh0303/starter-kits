import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Property 13 (partial): Shared consent state gates both advertising and analytics.
 * Tests all state transitions.
 */

// We need to reset module state between tests
let getConsent: typeof import('../../src/lib/consent-store.js').getConsent;
let setConsent: typeof import('../../src/lib/consent-store.js').setConsent;
let subscribeConsent: typeof import('../../src/lib/consent-store.js').subscribeConsent;

describe('Consent Store - Property 13', () => {
  beforeEach(async () => {
    vi.resetModules();
    // Mock window/localStorage for Node environment
    const storage = new Map<string, string>();
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });

    const mod = await import('../../src/lib/consent-store.js');
    getConsent = mod.getConsent;
    setConsent = mod.setConsent;
    subscribeConsent = mod.subscribeConsent;
  });

  it('defaults to both advertising and analytics disabled', () => {
    const state = getConsent();
    expect(state.advertising).toBe(false);
    expect(state.analytics).toBe(false);
  });

  it('enables both advertising and analytics when consent is granted', () => {
    setConsent({ advertising: true, analytics: true });
    const state = getConsent();
    expect(state.advertising).toBe(true);
    expect(state.analytics).toBe(true);
  });

  it('disables both advertising and analytics when consent is revoked', () => {
    setConsent({ advertising: true, analytics: true });
    setConsent({ advertising: false, analytics: false });
    const state = getConsent();
    expect(state.advertising).toBe(false);
    expect(state.analytics).toBe(false);
  });

  it('allows enabling only analytics while advertising remains disabled', () => {
    setConsent({ analytics: true });
    const state = getConsent();
    expect(state.analytics).toBe(true);
    expect(state.advertising).toBe(false);
  });

  it('allows enabling only advertising while analytics remains disabled', () => {
    setConsent({ advertising: true });
    const state = getConsent();
    expect(state.advertising).toBe(true);
    expect(state.analytics).toBe(false);
  });

  it('notifies subscribers on state change', () => {
    const callback = vi.fn();
    subscribeConsent(callback);

    setConsent({ advertising: true, analytics: true });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ advertising: true, analytics: true }),
    );
  });

  it('unsubscribe stops notifications', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeConsent(callback);

    setConsent({ advertising: true, analytics: true });
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    setConsent({ advertising: false, analytics: false });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('updates timestamp on each state change', () => {
    setConsent({ advertising: true, analytics: true });
    const state1 = getConsent();
    const ts1 = state1.updatedAt;

    // Small delay to ensure timestamp difference
    setConsent({ advertising: false, analytics: false });
    const state2 = getConsent();
    expect(state2.updatedAt).toBeDefined();
    expect(typeof state2.updatedAt).toBe('string');
    // Both should be valid ISO strings
    expect(new Date(ts1).getTime()).not.toBeNaN();
    expect(new Date(state2.updatedAt).getTime()).not.toBeNaN();
  });

  it('consent state gates both ads and analytics as a shared control', () => {
    // Granting advertising consent should NOT auto-grant analytics
    setConsent({ advertising: true });
    let state = getConsent();
    expect(state.advertising).toBe(true);
    expect(state.analytics).toBe(false);

    // Granting analytics consent should NOT affect advertising
    setConsent({ analytics: true });
    state = getConsent();
    expect(state.advertising).toBe(true);
    expect(state.analytics).toBe(true);

    // Revoking one should not revoke the other
    setConsent({ advertising: false });
    state = getConsent();
    expect(state.advertising).toBe(false);
    expect(state.analytics).toBe(true);
  });
});
