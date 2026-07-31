/**
 * Domain entities for commerce SaaS.
 */

export interface Product {
  id: string;
  shopifyProductId: string;
  title: string;
  description: string | null;
  priceInCents: number;
  currency: string;
  imageUrl: string | null;
  available: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  shopifyOrderId: string;
  customerId: string;
  status: OrderStatus;
  totalInCents: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface CartItem {
  productId: string;
  quantity: number;
  priceInCents: number;
}

export interface Customer {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAt: Date;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
