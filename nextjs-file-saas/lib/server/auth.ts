/**
 * Auth adapter for Clerk.
 * Extracts user identity from the Clerk session.
 */

import type { AuthContext } from "@/domain/policies";

/**
 * Get the auth context from a Clerk session.
 * In production, this calls Clerk's auth() from @clerk/nextjs/server.
 * For testing, accepts userId directly.
 */
export function buildAuthContext(userId: string | null): AuthContext | null {
  if (!userId) return null;
  return { userId };
}
