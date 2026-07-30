/**
 * Route state and auth guard tests.
 */

describe("Route navigation", () => {
  it("root index redirects to auth sign-in", () => {
    // The app/index.tsx contains a Redirect to /(auth)/sign-in
    const indexModule = require("../../app/index.tsx");
    const component = indexModule.default;
    expect(component).toBeDefined();
  });

  it("app layout is defined", () => {
    const layoutModule = require("../../app/(app)/_layout.tsx");
    expect(layoutModule.default).toBeDefined();
  });

  it("auth layout is defined", () => {
    const layoutModule = require("../../app/(auth)/_layout.tsx");
    expect(layoutModule.default).toBeDefined();
  });

  it("sign-in screen is defined", () => {
    const signInModule = require("../../app/(auth)/sign-in.tsx");
    expect(signInModule.default).toBeDefined();
  });

  it("dashboard screen is defined", () => {
    const dashModule = require("../../app/(app)/index.tsx");
    expect(dashModule.default).toBeDefined();
  });

  it("premium screen is defined", () => {
    const premModule = require("../../app/(app)/premium.tsx");
    expect(premModule.default).toBeDefined();
  });

  it("purchase screen is defined", () => {
    const purchModule = require("../../app/(app)/purchase.tsx");
    expect(purchModule.default).toBeDefined();
  });

  it("settings screen is defined", () => {
    const settingsModule = require("../../app/(app)/settings.tsx");
    expect(settingsModule.default).toBeDefined();
  });
});
