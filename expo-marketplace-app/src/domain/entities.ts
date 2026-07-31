export interface Listing { id: string; sellerId: string; title: string; description: string; price: number; currency: string; category: string; location: { lat: number; lng: number } | null; imageUrls: string[]; status: "active" | "sold" | "archived"; createdAt: string; }
export interface Order { id: string; listingId: string; buyerId: string; sellerId: string; amount: number; currency: string; status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"; createdAt: string; }
export interface Seller { id: string; displayName: string; rating: number; reviewCount: number; verified: boolean; }
export interface Review { id: string; orderId: string; reviewerId: string; sellerId: string; rating: number; comment: string; createdAt: string; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
