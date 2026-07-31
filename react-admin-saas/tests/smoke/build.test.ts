import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("domain entities can be imported", async () => {
    const mod = await import("@/domain/entities");
    expect(mod).toBeDefined();
  });
  it("domain policies can be imported", async () => {
    const mod = await import("@/domain/policies");
    expect(mod).toBeDefined();
    expect(typeof mod.canViewContact).toBe("function");
  });
  it("config can be imported", async () => {
    const mod = await import("@/lib/config");
    expect(typeof mod.validateConfig).toBe("function");
  });
  it("fake billing can be imported", async () => {
    const { FakeBillingAdapter } = await import("@/lib/billing-fake");
    const a = new FakeBillingAdapter();
    expect(typeof a.verifyWebhook).toBe("function");
  });
});
