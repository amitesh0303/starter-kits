import * as fc from "fast-check";
import { estimateReadTime, isArticleRead } from "@/domain/policies";
import { ReadingProgress } from "@/domain/entities";
describe("Property: Reading progress", () => {
  it("read time is always >= 1", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 100000 }), (words) => {
      expect(estimateReadTime(words)).toBeGreaterThanOrEqual(1);
    }), { numRuns: 150 });
  });
  it("100% scroll is always read", () => {
    fc.assert(fc.property(fc.boolean(), (completed) => {
      const p: ReadingProgress = { articleId: "a", scrollPercent: 100, completed, lastReadAt: "" };
      expect(isArticleRead(p)).toBe(true);
    }), { numRuns: 150 });
  });
});
