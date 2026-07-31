import * as fc from "fast-check";
import { calculateDistance, estimateArrivalMinutes } from "@/domain/policies";
describe("Property: Route calculations", () => {
  it("distance is always non-negative", () => {
    fc.assert(fc.property(fc.double({min:-90,max:90,noNaN:true}), fc.double({min:-180,max:180,noNaN:true}), fc.double({min:-90,max:90,noNaN:true}), fc.double({min:-180,max:180,noNaN:true}), (lat1, lng1, lat2, lng2) => {
      expect(calculateDistance(lat1, lng1, lat2, lng2)).toBeGreaterThanOrEqual(0);
    }), { numRuns: 150 });
  });
  it("arrival time decreases with higher speed", () => {
    fc.assert(fc.property(fc.double({min:1,max:100,noNaN:true}), fc.double({min:1,max:200,noNaN:true}), (dist, speed) => {
      const t1 = estimateArrivalMinutes(dist, speed);
      const t2 = estimateArrivalMinutes(dist, speed * 2);
      expect(t2).toBeLessThanOrEqual(t1);
    }), { numRuns: 150 });
  });
});
