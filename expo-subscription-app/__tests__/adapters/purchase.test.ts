import { createFakePurchaseAdapter } from "@/adapters/purchase-adapter";

describe("Purchase adapter (fake RevenueCat)", () => {
  it("returns offerings", async () => {
    const adapter = createFakePurchaseAdapter("user-1");
    const offerings = await adapter.getOfferings();
    expect(offerings.length).toBeGreaterThan(0);
    expect(offerings[0]).toHaveProperty("id");
    expect(offerings[0]).toHaveProperty("name");
    expect(offerings[0]).toHaveProperty("priceString");
  });

  it("completes a purchase and returns entitlement", async () => {
    const adapter = createFakePurchaseAdapter("user-1");
    const offerings = await adapter.getOfferings();
    const entitlement = await adapter.purchase(offerings[0].id);
    expect(entitlement.isActive).toBe(true);
    expect(entitlement.source).toBe("revenuecat");
    expect(entitlement.profileId).toBe("user-1");
    expect(entitlement.productId).toBe(offerings[0].id);
  });

  it("restores purchases returns previously purchased", async () => {
    const adapter = createFakePurchaseAdapter("user-2");
    const offerings = await adapter.getOfferings();
    await adapter.purchase(offerings[0].id);
    const restored = await adapter.restorePurchases();
    expect(restored).toHaveLength(1);
    expect(restored[0].productId).toBe(offerings[0].id);
  });

  it("returns active entitlements", async () => {
    const adapter = createFakePurchaseAdapter("user-3");
    const offerings = await adapter.getOfferings();
    await adapter.purchase(offerings[0].id);

    const active = await adapter.getActiveEntitlements();
    expect(active).toHaveLength(1);
    expect(active[0].isActive).toBe(true);
  });

  it("initializes without error", async () => {
    const adapter = createFakePurchaseAdapter("user-4");
    await expect(adapter.initialize(null)).resolves.not.toThrow();
  });
});
