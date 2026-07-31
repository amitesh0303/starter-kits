export interface Delivery { id: string; driverId: string; status: "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled"; pickupAddress: string; deliveryAddress: string; estimatedArrival: string | null; createdAt: string; }
export interface Route { id: string; deliveryId: string; waypoints: Array<{ lat: number; lng: number; order: number }>; distanceKm: number; estimatedMinutes: number; }
export interface LocationUpdate { id: string; driverId: string; lat: number; lng: number; speed: number; heading: number; timestamp: string; }
export interface Driver { id: string; name: string; email: string; vehicleType: string; isOnline: boolean; currentLocation: { lat: number; lng: number } | null; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
