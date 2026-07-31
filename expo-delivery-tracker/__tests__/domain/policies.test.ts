import { isValidDeliveryTransition, isDeliveryComplete, calculateDistance, estimateArrivalMinutes, isLocationStale } from "@/domain/policies";
import { Delivery, LocationUpdate } from "@/domain/entities";
describe("Route optimization policies", () => {
  it("valid transitions", () => {
    expect(isValidDeliveryTransition("assigned", "picked_up")).toBe(true);
    expect(isValidDeliveryTransition("assigned", "delivered")).toBe(false);
    expect(isValidDeliveryTransition("in_transit", "delivered")).toBe(true);
  });
  it("detects complete deliveries", () => {
    const d: Delivery = { id: "d1", driverId: "dr1", status: "delivered", pickupAddress: "", deliveryAddress: "", estimatedArrival: null, createdAt: "" };
    expect(isDeliveryComplete(d)).toBe(true);
    expect(isDeliveryComplete({ ...d, status: "in_transit" })).toBe(false);
  });
  it("calculates distance", () => { const d = calculateDistance(40.7128, -74.006, 40.7589, -73.9851); expect(d).toBeGreaterThan(0); expect(d).toBeLessThan(10); });
  it("estimates arrival", () => { expect(estimateArrivalMinutes(10, 30)).toBe(20); expect(estimateArrivalMinutes(10, 0)).toBe(Infinity); });
  it("detects stale location", () => {
    const fresh: LocationUpdate = { id: "l1", driverId: "d1", lat: 0, lng: 0, speed: 0, heading: 0, timestamp: new Date().toISOString() };
    const stale: LocationUpdate = { ...fresh, timestamp: new Date(Date.now() - 600000).toISOString() };
    expect(isLocationStale(fresh)).toBe(false);
    expect(isLocationStale(stale)).toBe(true);
  });
});
