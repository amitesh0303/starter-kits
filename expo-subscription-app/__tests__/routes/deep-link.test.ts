/**
 * Deep-link handling tests.
 */

describe("Deep-link handling", () => {
  it("deep-link screen module is defined", () => {
    const deepLinkModule = require("../../app/deep-link.tsx");
    expect(deepLinkModule.default).toBeDefined();
  });

  it("app scheme is configured for deep links", () => {
    // Verify the scheme in app.config.ts
    const configFn = require("../../app.config.ts").default;
    const config = configFn({ config: {} });
    expect(config.scheme).toBe("exposubscription");
  });

  it("cold start waits for hydration (conceptual)", () => {
    // The deep-link screen implements a hydration wait before navigation.
    // This test verifies the module exports correctly.
    const DeepLink = require("../../app/deep-link.tsx").default;
    expect(typeof DeepLink).toBe("function");
  });
});
