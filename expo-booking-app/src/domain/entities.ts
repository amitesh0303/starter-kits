export interface Booking { id: string; userId: string; venueId: string; timeSlotId: string; status: "confirmed" | "pending" | "cancelled"; totalAmount: number; currency: string; createdAt: string; }
export interface TimeSlot { id: string; venueId: string; startTime: string; endTime: string; available: boolean; price: number; }
export interface Venue { id: string; name: string; description: string; address: string; location: { lat: number; lng: number }; rating: number; imageUrls: string[]; }
export interface Review { id: string; bookingId: string; userId: string; venueId: string; rating: number; comment: string; createdAt: string; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
