/**
 * Core domain entities for the AI companion app.
 */

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  tier: "free" | "premium";
  messagesUsedToday: number;
  dailyMessageLimit: number;
  createdAt: string;
}

export interface UsageQuota {
  dailyLimit: number;
  used: number;
  resetsAt: string;
}

export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";

export interface PendingAction {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  state: PendingActionState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}
