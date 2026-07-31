/**
 * Domain entities for AI SaaS with usage metering.
 */

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  tokenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tokenCount: number;
  createdAt: Date;
}

export type MessageRole = "user" | "assistant" | "system";

export interface UsageRecord {
  id: string;
  userId: string;
  meterId: string;
  quantity: number;
  recordedAt: Date;
}

export interface UsageLimit {
  id: string;
  userId: string;
  maxTokensPerMonth: number;
  currentUsage: number;
  resetAt: Date;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";
