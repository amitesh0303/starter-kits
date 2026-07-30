/**
 * Domain entity types for the AI SaaS application.
 * These represent the core business objects.
 */

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface Generation {
  id: string;
  workspaceId: string;
  conversationId: string | null;
  promptTokens: number;
  completionTokens: number;
  model: string;
  createdAt: Date;
}

export type EntitlementStatus =
  | "active"
  | "past_due"
  | "cancelled"
  | "trialing";

export interface Entitlement {
  id: string;
  workspaceId: string;
  lemonSqueezyCustomerId: string;
  lemonSqueezySubscriptionId: string;
  lemonSqueezyVariantId: string;
  status: EntitlementStatus;
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
