/**
 * Property 10: Mobile monetization eligibility.
 *
 * Uses fast-check for 100+ generated cases verifying:
 * 1. Digital goods ALWAYS route through RevenueCat
 * 2. Digital goods NEVER route through Stripe or direct
 * 3. Non-digital goods can use any channel
 */

import * as fc from "fast-check";
import {
  getEligibleChannel,
  isValidDigitalPurchaseChannel,
  Product,
  ProductType,
  PurchaseChannel,
} from "@/domain/eligibility";

const productTypeArb = fc.oneof(
  fc.constant("digital" as ProductType),
  fc.constant("physical" as ProductType),
  fc.constant("service" as ProductType)
);

const channelArb = fc.oneof(
  fc.constant("revenuecat" as PurchaseChannel),
  fc.constant("stripe" as PurchaseChannel),
  fc.constant("direct" as PurchaseChannel)
);

const productArb = fc.record({
  id: fc.uuid(),
  type: productTypeArb,
  name: fc.string({ minLength: 1, maxLength: 50 }),
});

describe("Property 10: Monetization eligibility routing", () => {
  it("digital goods always route through RevenueCat", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (id, name) => {
          const product: Product = { id, type: "digital", name };
          const result = getEligibleChannel(product);
          expect(result.eligible).toBe(true);
          expect(result.channel).toBe("revenuecat");
        }
      ),
      { numRuns: 150 }
    );
  });

  it("digital goods never allow Stripe channel", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (id, name) => {
          const product: Product = { id, type: "digital", name };
          expect(isValidDigitalPurchaseChannel(product, "stripe")).toBe(false);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("digital goods never allow direct channel", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (id, name) => {
          const product: Product = { id, type: "digital", name };
          expect(isValidDigitalPurchaseChannel(product, "direct")).toBe(false);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("non-digital goods accept any purchase channel", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.oneof(
          fc.constant("physical" as ProductType),
          fc.constant("service" as ProductType)
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        channelArb,
        (id, type, name, channel) => {
          const product: Product = { id, type, name };
          expect(isValidDigitalPurchaseChannel(product, channel)).toBe(true);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("all products get a valid eligibility result", () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const result = getEligibleChannel(product);
        expect(result.eligible).toBe(true);
        expect(result.channel).not.toBeNull();
        expect(["revenuecat", "stripe", "direct"]).toContain(result.channel);
      }),
      { numRuns: 150 }
    );
  });

  it("digital product eligibility is deterministic", () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const result1 = getEligibleChannel(product);
        const result2 = getEligibleChannel(product);
        expect(result1).toEqual(result2);
      }),
      { numRuns: 150 }
    );
  });

  it("channel validation is consistent with eligibility routing", () => {
    fc.assert(
      fc.property(productArb, channelArb, (product, channel) => {
        const eligibility = getEligibleChannel(product);
        const isValid = isValidDigitalPurchaseChannel(product, channel);

        if (product.type === "digital") {
          // For digital, only revenuecat is valid
          if (channel === "revenuecat") {
            expect(isValid).toBe(true);
            expect(eligibility.channel).toBe("revenuecat");
          } else {
            expect(isValid).toBe(false);
          }
        } else {
          // For non-digital, any channel is valid
          expect(isValid).toBe(true);
        }
      }),
      { numRuns: 150 }
    );
  });
});
