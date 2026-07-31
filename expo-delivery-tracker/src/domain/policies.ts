import { Delivery, LocationUpdate } from "./entities";

/** Valid delivery status transitions. */
const VALID_TRANSITIONS: Record<string, string[]> = {
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Check if a delivery status transition is valid. */
export function isValidDeliveryTransition(from: string, to: string): boolean {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

/** Check if delivery is in a terminal state. */
export function isDeliveryComplete(delivery: Delivery): boolean {
  return delivery.status === "delivered" || delivery.status === "cancelled";
}

/** Calculate distance between two coordinates (Haversine approximation in km). */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Estimate arrival time based on distance and speed. */
export function estimateArrivalMinutes(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) return Infinity;
  return Math.round((distanceKm / speedKmh) * 60);
}

/** Check if location update is stale (older than 5 minutes). */
export function isLocationStale(update: LocationUpdate, nowMs: number = Date.now()): boolean {
  return nowMs - new Date(update.timestamp).getTime() > 5 * 60 * 1000;
}
