/**
 * Authorization policies for membership content.
 */

import type { Article, Subscriber } from "./entities";

export interface AuthContext {
  userId: string;
}

export function canReadArticle(ctx: AuthContext, article: Article, subscriber: Subscriber | null): boolean {
  if (article.tier === "free") return true;
  if (!ctx.userId || !subscriber) return false;
  if (article.tier === "member") return subscriber.tier === "member" || subscriber.tier === "premium";
  if (article.tier === "premium") return subscriber.tier === "premium";
  return false;
}

export function canPublishArticle(ctx: AuthContext, authorIds: string[]): boolean {
  if (!ctx.userId) return false;
  return authorIds.includes(ctx.userId);
}

export function canSendNewsletter(ctx: AuthContext, authorIds: string[]): boolean {
  if (!ctx.userId) return false;
  return authorIds.includes(ctx.userId);
}

export function canManageSubscribers(ctx: AuthContext, adminIds: string[]): boolean {
  if (!ctx.userId) return false;
  return adminIds.includes(ctx.userId);
}
