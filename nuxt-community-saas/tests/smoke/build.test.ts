import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("domain entities", async () => { expect(await import("@/domain/entities")).toBeDefined(); });
  it("domain policies", async () => { const m = await import("@/domain/policies"); expect(typeof m.canCreateThread).toBe("function"); });
  it("config", async () => { const m = await import("@/server/utils/config"); expect(typeof m.validateConfig).toBe("function"); });
  it("fake billing", async () => { const { FakeBillingAdapter } = await import("@/server/utils/billing-fake"); expect(new FakeBillingAdapter()).toBeDefined(); });
});
