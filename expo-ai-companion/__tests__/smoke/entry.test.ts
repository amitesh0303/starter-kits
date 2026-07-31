describe("App entry smoke test", () => {
  it("root layout module loads", () => { const m = require("../../app/_layout.tsx"); expect(m.default).toBeDefined(); });
  it("domain module exports", () => { const d = require("../../src/domain/index.ts"); expect(d.canSendMessage).toBeDefined(); expect(d.isValidMessage).toBeDefined(); });
  it("adapters module exports", () => { const a = require("../../src/adapters/index.ts"); expect(a.getConfig).toBeDefined(); expect(a.createFakeAuthAdapter).toBeDefined(); expect(a.createFakeAIAdapter).toBeDefined(); });
  it("config validates in fake mode", () => { const { validateConfig } = require("../../src/adapters/config.ts"); const r = validateConfig(); expect(r.config.isFakeMode).toBe(true); });
});
