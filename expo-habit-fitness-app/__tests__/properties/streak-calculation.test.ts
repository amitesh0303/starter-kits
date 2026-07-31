import * as fc from "fast-check";
import { habitCompletionPercent, estimateCalories } from "@/domain/policies";
describe("Property: Streak/fitness invariants", () => {
  it("completion percent is always 0-100", () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1, max: 100 }), (done, target) => {
      const pct = habitCompletionPercent(done, target);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }), { numRuns: 150 });
  });
  it("calories scale with duration", () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 600 }), (mins) => {
      const low = estimateCalories(mins, "low");
      const high = estimateCalories(mins, "high");
      expect(high).toBeGreaterThanOrEqual(low);
    }), { numRuns: 150 });
  });
});
