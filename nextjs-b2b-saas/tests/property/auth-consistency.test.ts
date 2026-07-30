/**
 * Property 4: Authentication and access consistency with RBAC.
 * For any identity state, role, and action: access is granted
 * iff authentication is valid AND role meets minimum requirement.
 * Uses fast-check to generate random auth contexts, roles, and actions.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canPerformAction,
  canAccessOrganization,
  canManageOrganization,
  canDeleteOrganization,
  canInviteMembers,
  canManageBilling,
  roleHasLevel,
  getAllActions,
  getMinimumRole,
  hasActiveSubscription,
} from "@/domain/policies";
import type { AuthContext, Action } from "@/domain/policies";
import type { Membership, Role, MembershipStatus, Subscription, SubscriptionStatus } from "@/domain/entities";

// Arbitrary generators

const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });
const roleArb = fc.constantFrom<Role>("owner", "admin", "member");
const membershipStatusArb = fc.constantFrom<MembershipStatus>("active", "pending", "revoked");
const subscriptionStatusArb = fc.constantFrom<SubscriptionStatus>("active", "past_due", "cancelled", "trialing");
const actionArb = fc.constantFrom<Action>(
  "org:read",
  "org:update",
  "org:delete",
  "member:invite",
  "member:remove",
  "member:update_role",
  "billing:manage",
  "billing:view",
  "customer:create",
  "customer:view"
);

const membershipArb = fc.record({
  id: fc.uuid(),
  organizationId: fc.uuid(),
  userId: userIdArb,
  email: fc.string({ minLength: 5, maxLength: 30 }).map((s) => `${s}@test.com`),
  role: roleArb,
  status: membershipStatusArb,
  invitedBy: fc.option(userIdArb, { nil: null }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const subscriptionArb = fc.record({
  id: fc.uuid(),
  organizationId: fc.uuid(),
  paddleSubscriptionId: fc.string({ minLength: 5, maxLength: 20 }),
  paddlePriceId: fc.string({ minLength: 5, maxLength: 20 }),
  status: subscriptionStatusArb,
  currentPeriodEnd: fc.date(),
  cancelAtPeriodEnd: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Optionally empty userId to simulate unauthenticated
const authContextArb = fc.oneof(
  fc.record({ userId: userIdArb }),
  fc.constant({ userId: "" })
);

describe("Property 4: Authentication and Access Consistency with RBAC", () => {
  it("unauthenticated always denied for any action and membership", () => {
    fc.assert(
      fc.property(actionArb, membershipArb, (action, membership) => {
        const unauthCtx: AuthContext = { userId: "" };
        expect(canPerformAction(unauthCtx, action, membership)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("null membership always denied for any authenticated user and action", () => {
    fc.assert(
      fc.property(authContextArb, actionArb, (ctx, action) => {
        expect(canPerformAction(ctx, action, null)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("inactive membership (pending/revoked) always denied", () => {
    fc.assert(
      fc.property(
        userIdArb,
        actionArb,
        roleArb,
        fc.constantFrom<MembershipStatus>("pending", "revoked"),
        (userId, action, role, status) => {
          const ctx: AuthContext = { userId };
          const membership: Membership = {
            id: "mem_1",
            organizationId: "org_1",
            userId,
            email: "test@test.com",
            role,
            status,
            invitedBy: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          expect(canPerformAction(ctx, action, membership)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("access iff authenticated AND active AND role meets minimum", () => {
    fc.assert(
      fc.property(
        userIdArb,
        actionArb,
        roleArb,
        (userId, action, role) => {
          const ctx: AuthContext = { userId };
          const membership: Membership = {
            id: "mem_1",
            organizationId: "org_1",
            userId,
            email: "test@test.com",
            role,
            status: "active",
            invitedBy: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = canPerformAction(ctx, action, membership);
          const minimumRole = getMinimumRole(action);
          const expected = roleHasLevel(role, minimumRole);

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("role hierarchy is consistent: owner > admin > member", () => {
    fc.assert(
      fc.property(actionArb, (action) => {
        const minimumRole = getMinimumRole(action);

        // Owner always has access
        expect(roleHasLevel("owner", minimumRole)).toBe(true);

        // If member has access, admin must too
        if (roleHasLevel("member", minimumRole)) {
          expect(roleHasLevel("admin", minimumRole)).toBe(true);
          expect(roleHasLevel("owner", minimumRole)).toBe(true);
        }

        // If admin has access, owner must too
        if (roleHasLevel("admin", minimumRole)) {
          expect(roleHasLevel("owner", minimumRole)).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("subscription status active/trialing considered active, others not", () => {
    fc.assert(
      fc.property(subscriptionArb, (subscription: Subscription) => {
        const result = hasActiveSubscription(subscription);
        const expected =
          subscription.status === "active" || subscription.status === "trialing";
        expect(result).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });
});
