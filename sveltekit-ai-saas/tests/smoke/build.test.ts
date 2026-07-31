import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("domain entities", async () => { expect(await import("$lib/domain/entities")).toBeDefined(); });
  it("domain policies", async () => { const m = await import("$lib/domain/policies"); expect(typeof m.canAccessConversation).toBe("function"); });
  it("server config", async () => { const m = await import("$lib/server/config"); expect(typeof m.validateConfig).toBe("function"); });
  it("fake billing", async () => { const { FakeBillingAdapter } = await import("$lib/server/billing-fake"); expect(new FakeBillingAdapter()).toBeDefined(); });
});
