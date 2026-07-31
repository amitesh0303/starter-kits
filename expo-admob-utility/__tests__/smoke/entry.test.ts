describe("App entry smoke test", () => {
  it("root layout module loads", () => {
    const mod = require("../../app/_layout.tsx");
    expect(mod.default).toBeDefined();
  });

  it("domain module exports", () => {
    const domain = require("../../src/domain/index.ts");
    expect(domain.canShowInterstitial).toBeDefined();
    expect(domain.canAccessTool).toBeDefined();
    expect(domain.partitionTools).toBeDefined();
  });

  it("adapters module exports", () => {
    const adapters = require("../../src/adapters/index.ts");
    expect(adapters.getConfig).toBeDefined();
    expect(adapters.createFakeAdMobAdapter).toBeDefined();
    expect(adapters.createFakeAnalyticsAdapter).toBeDefined();
    expect(adapters.createFakePurchaseAdapter).toBeDefined();
  });

  it("config validates in fake mode", () => {
    const { validateConfig } = require("../../src/adapters/config.ts");
    const result = validateConfig();
    expect(result.config).toBeDefined();
    expect(result.config.isFakeMode).toBe(true);
  });
});
