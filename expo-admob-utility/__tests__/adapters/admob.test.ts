import { createFakeAdMobAdapter } from "@/adapters/admob-adapter";

describe("AdMob adapter (fake)", () => {
  it("shows banner without error", async () => {
    const adapter = createFakeAdMobAdapter();
    await expect(adapter.showBanner()).resolves.not.toThrow();
  });

  it("shows interstitial", async () => {
    const adapter = createFakeAdMobAdapter();
    const shown = await adapter.showInterstitial();
    expect(shown).toBe(true);
  });

  it("reports ad-free status", () => {
    const adapter = createFakeAdMobAdapter();
    expect(adapter.isAdFree()).toBe(false);
  });
});
