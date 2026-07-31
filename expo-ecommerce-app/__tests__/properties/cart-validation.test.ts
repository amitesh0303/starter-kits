import * as fc from "fast-check";
import { calculateSubtotal, isValidQuantity } from "@/domain/policies";
import { CartItem } from "@/domain/entities";
describe("Property: Cart invariants", () => {
  it("subtotal is non-negative", () => {
    fc.assert(fc.property(fc.array(fc.record({ variantId: fc.string(), productId: fc.string(), title: fc.string(), price: fc.double({min:0,max:1000,noNaN:true}), quantity: fc.integer({min:1,max:10}), imageUrl: fc.constant(null) }), { maxLength: 20 }), (items) => {
      expect(calculateSubtotal(items as CartItem[])).toBeGreaterThanOrEqual(0);
    }), { numRuns: 150 });
  });
  it("valid quantities are 1-10", () => {
    fc.assert(fc.property(fc.integer({min:1,max:10}), (q) => {
      expect(isValidQuantity(q)).toBe(true);
    }), { numRuns: 150 });
  });
});
