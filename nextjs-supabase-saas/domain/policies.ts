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
 *
 * Design note: In this starter kit, project-level permissions are intentionally
 * not implemented separately. Tenant-level membership is sufficient to access any
 * project within that tenant. This keeps the authorization model simple for the
 * common case where all tenant members collaborate on all projects. If per-project
 * access control is needed, extend this function to accept a projectId parameter
 * and check a project_memberships table or project visibility setting.
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
