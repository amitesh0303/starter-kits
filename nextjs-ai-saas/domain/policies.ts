/**
 * Deny-by-default authorization policies.
 * All access checks return false unless an explicit allow condition is met.
 */

import type { Workspace, Entitlement, EntitlementStatus } from "./entities";

export interface AuthContext {
  userId: string;
}

/**
 * Check if a user can access a workspace.
 * Requires the user to be the workspace owner.
 */
export function canAccessWorkspace(
  ctx: AuthContext,
  workspace: Workspace
): boolean {
  if (!ctx.userId) return false;
  return workspace.ownerId === ctx.userId;
}

/**
 * Check if a user can manage (update/delete) a workspace.
 * Requires the user to be the workspace owner.
 */
export function canManageWorkspace(
  ctx: AuthContext,
  workspace: Workspace
): boolean {
  if (!ctx.userId) return false;
  return workspace.ownerId === ctx.userId;
}

/**
 * Active entitlement statuses that allow generation usage.
 */
const ACTIVE_STATUSES: EntitlementStatus[] = ["active", "trialing"];

/**
 * Check if a workspace has an active entitlement for AI generation.
 * Requires the user to own the workspace AND the entitlement to be active/trialing.
 */
export function canGenerate(
  ctx: AuthContext,
  workspace: Workspace,
  entitlement: Entitlement | null
): boolean {
  if (!ctx.userId) return false;
  if (workspace.ownerId !== ctx.userId) return false;
  if (!entitlement) return false;
  return ACTIVE_STATUSES.includes(entitlement.status);
}
