import { describe, it, expect } from "vitest";
import { createBillingAdapter } from "@/lib/server/billing";

describe("Billing Adapter", () => {
  const billing = createBillingAdapter();

  it("returns pricing plans", async () => {
    const plans = await billing.getPlans();
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.find((p) => p.id === "premium")).toBeDefined();
  });

  it("premium plan is featured", async () => {
    const plans = await billing.getPlans();
    const premium = plans.find((p) => p.id === "premium")!;
    expect(premium.featured).toBe(true);
  });

  it("creates checkout session", async () => {
    const session = await billing.createCheckoutSession("standard", "emp-1");
    expect(session.url).toContain("https://");
  });
});
