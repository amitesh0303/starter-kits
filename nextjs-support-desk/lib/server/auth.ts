/**
 * Auth.js adapter for identity extraction.
 * Provides helper functions to extract user context from Auth.js sessions.
 */

import { AuthenticationError } from "./errors";
import type { AuthContext } from "@/domain/policies";

export interface AuthSession {
  userId: string | null;
  email?: string | null;
}

/**
 * Require an authenticated user. Throws if userId is null.
 */
export function requireAuth(session: AuthSession): AuthContext {
  if (!session.userId) {
    throw new AuthenticationError();
  }
  return { userId: session.userId };
}

/**
 * Get optional auth context. Returns null if not authenticated.
 */
export function getOptionalAuth(session: AuthSession): AuthContext | null {
  if (!session.userId) {
    return null;
  }
  return { userId: session.userId };
}
