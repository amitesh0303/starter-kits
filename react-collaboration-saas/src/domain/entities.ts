/**
 * Domain entities for collaboration SaaS.
 */

export interface Document {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  collaboratorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  collaboratorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Cursor {
  userId: string;
  x: number;
  y: number;
  documentId: string;
}

export interface Presence {
  userId: string;
  documentId: string;
  lastSeenAt: Date;
  isActive: boolean;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
