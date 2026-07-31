export interface Event { id: string; title: string; description: string; venue: string; startDate: string; endDate: string; capacity: number; ticketsSold: number; price: number; currency: string; imageUrl: string | null; }
export interface Ticket { id: string; eventId: string; attendeeId: string; type: "general" | "vip"; qrCode: string; status: "valid" | "used" | "refunded"; purchasedAt: string; }
export interface Attendee { id: string; name: string; email: string; ticketId: string; checkedIn: boolean; checkedInAt: string | null; }
export interface CheckIn { id: string; ticketId: string; attendeeId: string; eventId: string; timestamp: string; method: "qr" | "manual"; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
