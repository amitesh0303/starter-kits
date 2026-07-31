export interface Product { id: string; title: string; description: string; price: number; compareAtPrice: number | null; currency: string; images: string[]; variants: Array<{ id: string; title: string; available: boolean; price: number }>; available: boolean; }
export interface CartItem { variantId: string; productId: string; title: string; price: number; quantity: number; imageUrl: string | null; }
export interface Cart { id: string; items: CartItem[]; subtotal: number; currency: string; checkoutUrl: string | null; }
export interface Order { id: string; orderNumber: string; status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"; totalAmount: number; currency: string; items: Array<{ title: string; quantity: number; price: number }>; createdAt: string; }
export interface Customer { id: string; email: string; firstName: string; lastName: string; ordersCount: number; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
