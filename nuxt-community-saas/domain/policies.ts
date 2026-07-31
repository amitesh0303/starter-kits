/**
 * Authorization policies for community forum.
 */

import type { Thread, Membership } from "./entities";

export interface AuthContext {
  userId: string;
}

export function canCreateThread(ctx: AuthContext, memberships: Membership[], communityId: string): boolean {
  if (!ctx.userId) return false;
  return memberships.some((m) => m.userId === ctx.userId && m.communityId === communityId);
}

export function canModerateThread(ctx: AuthContext, memberships: Membership[], communityId: string): boolean {
  if (!ctx.userId) return false;
  const allowed: string[] = ["owner", "moderator"];
  return memberships.some((m) => m.userId === ctx.userId && m.communityId === communityId && allowed.includes(m.role));
}

export function canDeletePost(ctx: AuthContext, postAuthorId: string, memberships: Membership[], communityId: string): boolean {
  if (!ctx.userId) return false;
  if (ctx.userId === postAuthorId) return true;
  return canModerateThread(ctx, memberships, communityId);
}

export function canLockThread(ctx: AuthContext, thread: Thread, memberships: Membership[]): boolean {
  if (!ctx.userId) return false;
  void thread;
  const allowed: string[] = ["owner", "moderator"];
  return memberships.some((m) => m.userId === ctx.userId && allowed.includes(m.role));
}
