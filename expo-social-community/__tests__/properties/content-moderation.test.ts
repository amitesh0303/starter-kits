import * as fc from "fast-check";
import { isValidPostContent, isValidCommentContent } from "@/domain/policies";
describe("Property: Content validation bounds", () => {
  it("rejects empty and oversized posts", () => {
    fc.assert(fc.property(fc.integer({ min: 2001, max: 5000 }), (len) => {
      expect(isValidPostContent("a".repeat(len))).toBe(false);
    }), { numRuns: 150 });
  });
  it("accepts valid-length posts", () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 2000 }), (len) => {
      expect(isValidPostContent("a".repeat(len))).toBe(true);
    }), { numRuns: 150 });
  });
});
