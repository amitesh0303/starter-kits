import { canBookSlot, hasConflict, calculateTotal, canCancel, isValidRating } from "@/domain/policies";
import { TimeSlot, Booking } from "@/domain/entities";
describe("Booking policies", () => {
  const futureSlot: TimeSlot = { id: "s1", venueId: "v1", startTime: new Date(Date.now() + 86400000).toISOString(), endTime: new Date(Date.now() + 90000000).toISOString(), available: true, price: 50 };
  const pastSlot: TimeSlot = { ...futureSlot, startTime: "2020-01-01T09:00:00Z" };
  it("allows booking available future slot", () => { expect(canBookSlot(futureSlot)).toBe(true); });
  it("blocks unavailable slot", () => { expect(canBookSlot({ ...futureSlot, available: false })).toBe(false); });
  it("blocks past slot", () => { expect(canBookSlot(pastSlot)).toBe(false); });
  it("detects conflicts", () => {
    const bookings: Booking[] = [{ id: "b1", userId: "u1", venueId: "v1", timeSlotId: "s1", status: "confirmed", totalAmount: 50, currency: "USD", createdAt: "" }];
    expect(hasConflict(bookings, futureSlot)).toBe(true);
  });
  it("calculates total", () => { expect(calculateTotal([futureSlot, { ...futureSlot, id: "s2", price: 30 }])).toBe(80); });
  it("validates rating", () => { expect(isValidRating(3)).toBe(true); expect(isValidRating(0)).toBe(false); });
});
