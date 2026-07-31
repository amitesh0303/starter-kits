/**
 * Entry point smoke tests.
 * Verifies the app can be loaded without crashing.
 */

describe("App entry smoke test", () => {
  it("root layout module loads", () => {
    const mod = require("../../app/_layout.tsx");
    expect(mod.default).toBeDefined();
  });

  it("domain module exports all types", () => {
    const domain = require("../../src/domain/index.ts");
    expect(domain.getEligibleChannel).toBeDefined();
    expect(domain.isValidDigitalPurchaseChannel).toBeDefined();
    expect(domain.canAccessFeature).toBeDefined();
    expect(domain.partitionFeatures).toBeDefined();
    expect(domain.canEnqueue).toBeDefined();
    expect(domain.isValidTransition).toBeDefined();
    expect(domain.isTerminalState).toBeDefined();
    expect(domain.hasBeenApplied).toBeDefined();
  });

  it("adapters module exports all factories", () => {
    const adapters = require("../../src/adapters/index.ts");
    expect(adapters.getConfig).toBeDefined();
    expect(adapters.validateConfig).toBeDefined();
    expect(adapters.createFakeAuthAdapter).toBeDefined();
    expect(adapters.createFakePurchaseAdapter).toBeDefined();
    expect(adapters.createFakeErrorReporter).toBeDefined();
    expect(adapters.createSentryErrorReporter).toBeDefined();
    expect(adapters.redactPII).toBeDefined();
    expect(adapters.SentryErrorBoundary).toBeDefined();
  });

  it("sync module exports queue and engine", () => {
    const sync = require("../../src/sync/index.ts");
    expect(sync.createBoundedQueue).toBeDefined();
    expect(sync.createSyncEngine).toBeDefined();
  });

  it("config validates without crashing in fake mode", () => {
    const { validateConfig } = require("../../src/adapters/config.ts");
    const result = validateConfig();
    expect(result.config).toBeDefined();
    expect(result.config.isFakeMode).toBe(true);
    expect(result.config.queueCapacity).toBeGreaterThan(0);
  });
});
