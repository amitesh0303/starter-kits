import {
  getEligibleChannel,
  isValidDigitalPurchaseChannel,
  Product,
} from "@/domain/eligibility";

describe("Digital-goods eligibility rules", () => {
  it("routes digital goods only through RevenueCat", () => {
    const digital: Product = {
      id: "sub-1",
      type: "digital",
      name: "Premium Subscription",
    };
    const result = getEligibleChannel(digital);
    expect(result.eligible).toBe(true);
    expect(result.channel).toBe("revenuecat");
  });

  it("routes physical goods through Stripe", () => {
    const physical: Product = {
      id: "merch-1",
      type: "physical",
      name: "T-Shirt",
    };
    const result = getEligibleChannel(physical);
    expect(result.eligible).toBe(true);
    expect(result.channel).toBe("stripe");
  });

  it("routes services through Stripe", () => {
    const service: Product = {
      id: "svc-1",
      type: "service",
      name: "Consulting",
    };
    const result = getEligibleChannel(service);
    expect(result.eligible).toBe(true);
    expect(result.channel).toBe("stripe");
  });

  it("rejects Stripe for digital goods", () => {
    const digital: Product = {
      id: "sub-2",
      type: "digital",
      name: "In-app currency",
    };
    expect(isValidDigitalPurchaseChannel(digital, "stripe")).toBe(false);
    expect(isValidDigitalPurchaseChannel(digital, "direct")).toBe(false);
    expect(isValidDigitalPurchaseChannel(digital, "revenuecat")).toBe(true);
  });

  it("allows any channel for non-digital goods", () => {
    const physical: Product = {
      id: "merch-2",
      type: "physical",
      name: "Mug",
    };
    expect(isValidDigitalPurchaseChannel(physical, "stripe")).toBe(true);
    expect(isValidDigitalPurchaseChannel(physical, "revenuecat")).toBe(true);
    expect(isValidDigitalPurchaseChannel(physical, "direct")).toBe(true);
  });
});
