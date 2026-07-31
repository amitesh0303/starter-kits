import * as fc from "fast-check";
import { hasAvailableTickets, fillPercentage } from "@/domain/policies";
import { Event } from "@/domain/entities";
describe("Property: Ticket invariants", () => {
  it("fill percentage is 0-100", () => {
    fc.assert(fc.property(fc.integer({min:0,max:10000}), fc.integer({min:1,max:10000}), (sold, cap) => {
      const e: Event = { id:"", title:"", description:"", venue:"", startDate:"", endDate:"", capacity: cap, ticketsSold: sold, price: 0, currency:"", imageUrl: null };
      const pct = fillPercentage(e);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }), { numRuns: 150 });
  });
  it("no tickets available when sold >= capacity", () => {
    fc.assert(fc.property(fc.integer({min:1,max:1000}), (cap) => {
      const e: Event = { id:"", title:"", description:"", venue:"", startDate:"", endDate:"", capacity: cap, ticketsSold: cap, price: 0, currency:"", imageUrl: null };
      expect(hasAvailableTickets(e)).toBe(false);
    }), { numRuns: 150 });
  });
});
