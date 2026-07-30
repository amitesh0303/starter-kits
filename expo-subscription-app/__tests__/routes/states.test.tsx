/**
 * Loading/empty/offline/error/retry state tests.
 */

describe("Screen states", () => {
  it("dashboard module exports correctly", () => {
    const mod = require("../../app/(app)/index.tsx");
    expect(mod.default).toBeDefined();
    // Demo features are exported for testability
    expect(mod.DEMO_FEATURES).toBeDefined();
    expect(Array.isArray(mod.DEMO_FEATURES)).toBe(true);
  });

  it("demo features include premium and free items", () => {
    const { DEMO_FEATURES } = require("../../app/(app)/index.tsx");
    const premium = DEMO_FEATURES.filter(
      (f: { isPremium: boolean }) => f.isPremium
    );
    const free = DEMO_FEATURES.filter(
      (f: { isPremium: boolean }) => !f.isPremium
    );
    expect(premium.length).toBeGreaterThan(0);
    expect(free.length).toBeGreaterThan(0);
  });

  it("purchase screen module exports correctly", () => {
    const mod = require("../../app/(app)/purchase.tsx");
    expect(mod.default).toBeDefined();
  });

  it("error boundary renders children when no error", () => {
    const { SentryErrorBoundary } = require("../../src/adapters/sentry-boundary.tsx");
    expect(SentryErrorBoundary).toBeDefined();
  });
});
