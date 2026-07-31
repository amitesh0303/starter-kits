import * as fc from "fast-check";
import { calculateTotal } from "@/domain/policies";
import { TimeSlot } from "@/domain/entities";
describe("Property: Booking total calculation", () => {
  it("total is sum of all slot prices", () => {
    fc.assert(fc.property(fc.array(fc.double({ min: 0.01, max: 1000, noNaN: true }), { minLength: 1, maxLength: 20 }), (prices) => {
      const slots: TimeSlot[] = prices.map((p, i) => ({ id: "s"+i, venueId: "v1", startTime: "", endTime: "", available: true, price: p }));
      const total = calculateTotal(slots);
      const expected = prices.reduce((s, p) => s + p, 0);
      expect(Math.abs(total - expected)).toBeLessThan(0.001);
    }), { numRuns: 150 });
  });
});
