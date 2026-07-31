/**
 * Deny-by-default RBAC authorization policies.
 * All access checks return false unless an explicit allow condition is met.
 *
 * Role hierarchy: owner > admin > member
 * Each action requires a minimum role level.
 */

import type { Role, Membership, Organization, Subscription, SubscriptionStatus } from "./entities";

export interface AuthContext {
  userId: string;
}

/**
 * Actions that can be performed within an organization.
 */
export type Action =
  | "org:read"
  | "org:update"
  | "org:delete"
  | "member:invite"
  | "member:remove"
  | "member:update_role"
  | "billing:manage"
  | "billing:view"
  | "customer:create"
  | "customer:view";

/**
 * Role hierarchy numeric levels.
 * Higher value = more permissions.
 */
const ROLE_LEVEL: Record<Role, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * Minimum role required for each action.
 */
const ACTION_MINIMUM_ROLE: Record<Action, Role> = {
  "org:read": "member",
  "org:update": "admin",
  "org:delete": "owner",
  "member:invite": "admin",
  "member:remove": "admin",
  "member:update_role": "owner",
  "billing:manage": "owner",
  "billing:view": "admin",
  "customer:create": "admin",
  "customer:view": "member",
};

/**
 * Check if a role meets the minimum required level.
 */
export function roleHasLevel(role: Role, minimumRole: Role): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[minimumRole];
}

/**
 * Find the active membership for a user in an organization.
 * Returns null if user has no active membership.
 */
export function findActiveMembership(
  ctx: AuthContext,
  organizationId: string,
  memberships: Membership[]
): Membership | null {
  if (!ctx.userId) return null;
  return (
    memberships.find(
      (m) =>
        m.userId === ctx.userId &&
        m.organizationId === organizationId &&
        m.status === "active"
    ) ?? null
  );
}

/**
 * Check if a user can perform an action within an organization.
 * Deny-by-default: returns false unless the user has an active membership
 * with sufficient role level.
 */
export function canPerformAction(
  ctx: AuthContext,
  action: Action,
  membership: Membership | null
): boolean {
  if (!ctx.userId) return false;
  if (!membership) return false;
  if (membership.status !== "active") return false;

  const minimumRole = ACTION_MINIMUM_ROLE[action];
  return roleHasLevel(membership.role, minimumRole);
}

/**
 * Check if a user can access an organization (read).
 */
export function canAccessOrganization(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "org:read", membership);
}

/**
 * Check if a user can manage (update) an organization.
 */
export function canManageOrganization(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "org:update", membership);
}

/**
 * Check if a user can delete an organization.
 */
export function canDeleteOrganization(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "org:delete", membership);
}

/**
 * Check if a user can invite members.
 */
export function canInviteMembers(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "member:invite", membership);
}

/**
 * Check if a user can remove members.
 */
export function canRemoveMembers(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "member:remove", membership);
}

/**
 * Check if a user can update member roles.
 */
export function canUpdateRoles(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "member:update_role", membership);
}

/**
 * Check if a user can manage billing.
 */
export function canManageBilling(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "billing:manage", membership);
}

/**
 * Check if a user can view billing information.
 */
export function canViewBilling(
  ctx: AuthContext,
  membership: Membership | null
): boolean {
  return canPerformAction(ctx, "billing:view", membership);
}

/**
 * Active subscription statuses that allow full org features.
 */
const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing"];

/**
 * Check if an organization has an active subscription.
 */
export function hasActiveSubscription(
  subscription: Subscription | null
): boolean {
  if (!subscription) return false;
  return ACTIVE_STATUSES.includes(subscription.status);
}

/**
 * Get all defined actions.
 */
export function getAllActions(): Action[] {
  return Object.keys(ACTION_MINIMUM_ROLE) as Action[];
}

/**
 * Get the minimum role for an action.
 */
export function getMinimumRole(action: Action): Role {
  return ACTION_MINIMUM_ROLE[action];
}
