/**
 * Clerk adapter for identity extraction from request.
 * Server-only module.
 */

import { AuthenticationError } from "./errors";

export interface AuthUser {
  userId: string;
  email: string | null;
}

/**
 * Extract user identity from Clerk auth context.
 * Throws AuthenticationError if no valid session.
 */
export function requireAuth(authResult: {
  userId: string | null;
}): AuthUser {
  if (!authResult.userId) {
    throw new AuthenticationError();
  }
  return {
    userId: authResult.userId,
    email: null,
  };
}

/**
 * Optionally extract user identity (returns null for unauthenticated).
 */
export function getOptionalAuth(authResult: {
  userId: string | null;
}): AuthUser | null {
  if (!authResult.userId) {
    return null;
  }
  return {
    userId: authResult.userId,
    email: null,
  };
}
