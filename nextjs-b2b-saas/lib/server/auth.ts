/**
 * Auth0 adapter for identity extraction.
 * Provides helper functions to extract user context from Auth0 sessions.
 * In test/dev without real Auth0 credentials, use the mock helpers.
 */

import { AuthenticationError } from "./errors";
import type { AuthContext } from "@/domain/policies";

export interface Auth0Session {
  userId: string | null;
  email?: string | null;
  orgId?: string | null;
}

/**
 * Require an authenticated user. Throws if userId is null.
 */
export function requireAuth(session: Auth0Session): AuthContext {
  if (!session.userId) {
    throw new AuthenticationError();
  }
  return { userId: session.userId };
}

/**
 * Get optional auth context. Returns null if not authenticated.
 */
export function getOptionalAuth(session: Auth0Session): AuthContext | null {
  if (!session.userId) {
    return null;
  }
  return { userId: session.userId };
}

/**
 * Extract organization ID from Auth0 session claims.
 * Returns null if no org context is present.
 */
export function getOrgFromSession(session: Auth0Session): string | null {
  return session.orgId ?? null;
}
