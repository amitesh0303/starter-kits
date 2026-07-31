import * as fc from "fast-check";
import { isValidListing } from "@/domain/policies";
describe("Property: Listing validation", () => {
  it("accepts valid titles and prices", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 100 }), fc.double({ min: 0.01, max: 999999.99, noNaN: true }), (title, price) => {
      expect(isValidListing({ title, price }).valid).toBe(true);
    }), { numRuns: 150 });
  });
});
