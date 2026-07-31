describe("App entry smoke test", () => {
  it("root layout loads", () => { expect(require("../../app/_layout.tsx").default).toBeDefined(); });
  it("domain exports", () => { const d = require("../../src/domain/index.ts"); expect(d.canAddToCart).toBeDefined(); expect(d.calculateSubtotal).toBeDefined(); });
  it("adapters exports", () => { const a = require("../../src/adapters/index.ts"); expect(a.getConfig).toBeDefined(); expect(a.createFakeShopifyAdapter).toBeDefined(); });
  it("config validates", () => { expect(require("../../src/adapters/config.ts").validateConfig().config.isFakeMode).toBe(true); });
});
