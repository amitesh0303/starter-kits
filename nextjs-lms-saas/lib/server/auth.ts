/**
 * Auth adapter for Clerk.
 * Extracts user identity and role from the Clerk session.
 */

import type { AuthContext, UserRole } from "@/domain/policies";

/**
 * Get the auth context from a Clerk session.
 * In production, this calls Clerk's auth() from @clerk/nextjs/server.
 * For testing, accepts userId and role directly.
 */
export function buildAuthContext(
  userId: string | null,
  role?: UserRole
): AuthContext | null {
  if (!userId) return null;
  return {
    userId,
    role: role ?? "learner",
  };
}

/**
 * Extract role from Clerk public metadata.
 * Clerk stores custom claims in publicMetadata on the user object.
 */
export function extractRoleFromMetadata(
  publicMetadata: Record<string, unknown> | null | undefined
): UserRole {
  if (!publicMetadata) return "learner";
  const role = publicMetadata.role;
  if (role === "creator") return "creator";
  return "learner";
}
