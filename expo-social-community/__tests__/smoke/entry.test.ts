describe("App entry smoke test", () => {
  it("root layout loads", () => { expect(require("../../app/_layout.tsx").default).toBeDefined(); });
  it("domain exports", () => { const d = require("../../src/domain/index.ts"); expect(d.isValidPostContent).toBeDefined(); expect(d.canDeletePost).toBeDefined(); });
  it("adapters exports", () => { const a = require("../../src/adapters/index.ts"); expect(a.getConfig).toBeDefined(); expect(a.createFakeChatAdapter).toBeDefined(); });
  it("config validates", () => { const { validateConfig } = require("../../src/adapters/config.ts"); expect(validateConfig().config.isFakeMode).toBe(true); });
});
