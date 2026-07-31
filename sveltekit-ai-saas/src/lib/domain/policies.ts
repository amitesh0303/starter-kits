/**
 * Authorization policies for AI SaaS.
 */

import type { Conversation, UsageLimit } from "./entities";

export interface AuthContext {
  userId: string;
}

export function canAccessConversation(ctx: AuthContext, conversation: Conversation): boolean {
  if (!ctx.userId) return false;
  return conversation.userId === ctx.userId;
}

export function canCreateMessage(ctx: AuthContext, limit: UsageLimit): boolean {
  if (!ctx.userId) return false;
  return limit.userId === ctx.userId && limit.currentUsage < limit.maxTokensPerMonth;
}

export function canDeleteConversation(ctx: AuthContext, conversation: Conversation): boolean {
  if (!ctx.userId) return false;
  return conversation.userId === ctx.userId;
}

export function hasExceededUsage(limit: UsageLimit): boolean {
  return limit.currentUsage >= limit.maxTokensPerMonth;
}
