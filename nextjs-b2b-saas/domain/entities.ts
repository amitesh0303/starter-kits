/**
 * Domain entity types for the B2B SaaS application.
 * These represent the core business objects: organizations, memberships, billing, and events.
 */

export type Role = "owner" | "admin" | "member";

export type MembershipStatus = "active" | "pending" | "revoked";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  role: Role;
  status: MembershipStatus;
  invitedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "trialing";

export interface Customer {
  id: string;
  organizationId: string;
  paddleCustomerId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  organizationId: string;
  paddleSubscriptionId: string;
  paddlePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processedAt: Date;
}
