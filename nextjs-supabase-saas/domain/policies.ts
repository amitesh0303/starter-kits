/**
 * Deny-by-default authorization policies.
 * All access checks return false unless an explicit allow condition is met.
 */

import type { Membership, MembershipRole } from "./entities";

export interface AuthContext {
  userId: string;
}

/**
 * Check if a user can access (read) a tenant's resources.
 * Requires the user to be a member of the tenant.
 */
export function canAccessTenant(
  ctx: AuthContext,
  memberships: Membership[]
): boolean {
  if (!ctx.userId) return false;
  return memberships.some((m) => m.userId === ctx.userId);
}

/**
 * Check if a user can manage (update/delete) a tenant.
 * Requires the user to be an owner or admin of the tenant.
 */
export function canManageTenant(
  ctx: AuthContext,
  memberships: Membership[]
): boolean {
  if (!ctx.userId) return false;
  const allowedRoles: MembershipRole[] = ["owner", "admin"];
  return memberships.some(
    (m) => m.userId === ctx.userId && allowedRoles.includes(m.role)
  );
}

/**
 * Check if a user can access a project within a tenant.
 * Requires the user to be a member of the owning tenant.
 */
export function canAccessProject(
  ctx: AuthContext,
  memberships: Membership[]
): boolean {
  if (!ctx.userId) return false;
  return memberships.some((m) => m.userId === ctx.userId);
}

/**
 * Check if a user can manage members (invite/remove/change role) of a tenant.
 * Requires the user to be an owner or admin of the tenant.
 */
export function canManageMembers(
  ctx: AuthContext,
  memberships: Membership[]
): boolean {
  if (!ctx.userId) return false;
  const allowedRoles: MembershipRole[] = ["owner", "admin"];
  return memberships.some(
    (m) => m.userId === ctx.userId && allowedRoles.includes(m.role)
  );
}
