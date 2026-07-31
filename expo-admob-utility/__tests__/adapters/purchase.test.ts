import { createFakePurchaseAdapter } from "@/adapters/purchase-adapter";

describe("Purchase adapter (fake RevenueCat)", () => {
  it("returns offerings", async () => {
    const adapter = createFakePurchaseAdapter();
    const offerings = await adapter.getOfferings();
    expect(offerings.length).toBeGreaterThan(0);
    expect(offerings[0]).toHaveProperty("id");
    expect(offerings[0]).toHaveProperty("priceString");
  });

  it("completes purchase", async () => {
    const adapter = createFakePurchaseAdapter();
    const result = await adapter.purchase("premium_monthly");
    expect(result.success).toBe(true);
    expect(await adapter.isPremium()).toBe(true);
  });

  it("restores purchases", async () => {
    const adapter = createFakePurchaseAdapter();
    await adapter.purchase("premium_monthly");
    const restored = await adapter.restorePurchases();
    expect(restored).toBe(true);
  });
});
