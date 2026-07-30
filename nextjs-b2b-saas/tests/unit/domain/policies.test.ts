/**
 * Unit tests for RBAC policies.
 * Tests all role/action combinations to verify deny-by-default behavior.
 */

import { describe, it, expect } from "vitest";
import {
  canPerformAction,
  canAccessOrganization,
  canManageOrganization,
  canDeleteOrganization,
  canInviteMembers,
  canRemoveMembers,
  canUpdateRoles,
  canManageBilling,
  canViewBilling,
  roleHasLevel,
  hasActiveSubscription,
  getAllActions,
  getMinimumRole,
} from "@/domain/policies";
import type { AuthContext, Action } from "@/domain/policies";
import type { Membership, Subscription, Role } from "@/domain/entities";

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "mem_1",
    organizationId: "org_1",
    userId: "user_1",
    email: "user@example.com",
    role: "member",
    status: "active",
    invitedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const ctx: AuthContext = { userId: "user_1" };
const emptyCtx: AuthContext = { userId: "" };

describe("RBAC Policies", () => {
  describe("roleHasLevel", () => {
    it("owner has level >= all roles", () => {
      expect(roleHasLevel("owner", "owner")).toBe(true);
      expect(roleHasLevel("owner", "admin")).toBe(true);
      expect(roleHasLevel("owner", "member")).toBe(true);
    });

    it("admin has level >= admin and member", () => {
      expect(roleHasLevel("admin", "owner")).toBe(false);
      expect(roleHasLevel("admin", "admin")).toBe(true);
      expect(roleHasLevel("admin", "member")).toBe(true);
    });

    it("member has level >= member only", () => {
      expect(roleHasLevel("member", "owner")).toBe(false);
      expect(roleHasLevel("member", "admin")).toBe(false);
      expect(roleHasLevel("member", "member")).toBe(true);
    });
  });

  describe("deny-by-default", () => {
    it("unauthenticated user denied all actions", () => {
      const membership = makeMembership();
      for (const action of getAllActions()) {
        expect(canPerformAction(emptyCtx, action, membership)).toBe(false);
      }
    });

    it("null membership denies all actions", () => {
      for (const action of getAllActions()) {
        expect(canPerformAction(ctx, action, null)).toBe(false);
      }
    });

    it("pending membership denies all actions", () => {
      const membership = makeMembership({ status: "pending" });
      for (const action of getAllActions()) {
        expect(canPerformAction(ctx, action, membership)).toBe(false);
      }
    });

    it("revoked membership denies all actions", () => {
      const membership = makeMembership({ status: "revoked" });
      for (const action of getAllActions()) {
        expect(canPerformAction(ctx, action, membership)).toBe(false);
      }
    });
  });

  describe("member role permissions", () => {
    const membership = makeMembership({ role: "member" });

    it("can read org", () => {
      expect(canPerformAction(ctx, "org:read", membership)).toBe(true);
    });

    it("cannot update org", () => {
      expect(canPerformAction(ctx, "org:update", membership)).toBe(false);
    });

    it("cannot delete org", () => {
      expect(canPerformAction(ctx, "org:delete", membership)).toBe(false);
    });

    it("cannot invite members", () => {
      expect(canPerformAction(ctx, "member:invite", membership)).toBe(false);
    });

    it("cannot remove members", () => {
      expect(canPerformAction(ctx, "member:remove", membership)).toBe(false);
    });

    it("cannot update roles", () => {
      expect(canPerformAction(ctx, "member:update_role", membership)).toBe(false);
    });

    it("cannot manage billing", () => {
      expect(canPerformAction(ctx, "billing:manage", membership)).toBe(false);
    });

    it("cannot view billing", () => {
      expect(canPerformAction(ctx, "billing:view", membership)).toBe(false);
    });

    it("can view customers", () => {
      expect(canPerformAction(ctx, "customer:view", membership)).toBe(true);
    });

    it("cannot create customers", () => {
      expect(canPerformAction(ctx, "customer:create", membership)).toBe(false);
    });
  });

  describe("admin role permissions", () => {
    const membership = makeMembership({ role: "admin" });

    it("can read org", () => {
      expect(canPerformAction(ctx, "org:read", membership)).toBe(true);
    });

    it("can update org", () => {
      expect(canPerformAction(ctx, "org:update", membership)).toBe(true);
    });

    it("cannot delete org", () => {
      expect(canPerformAction(ctx, "org:delete", membership)).toBe(false);
    });

    it("can invite members", () => {
      expect(canPerformAction(ctx, "member:invite", membership)).toBe(true);
    });

    it("can remove members", () => {
      expect(canPerformAction(ctx, "member:remove", membership)).toBe(true);
    });

    it("cannot update roles", () => {
      expect(canPerformAction(ctx, "member:update_role", membership)).toBe(false);
    });

    it("cannot manage billing", () => {
      expect(canPerformAction(ctx, "billing:manage", membership)).toBe(false);
    });

    it("can view billing", () => {
      expect(canPerformAction(ctx, "billing:view", membership)).toBe(true);
    });

    it("can create customers", () => {
      expect(canPerformAction(ctx, "customer:create", membership)).toBe(true);
    });

    it("can view customers", () => {
      expect(canPerformAction(ctx, "customer:view", membership)).toBe(true);
    });
  });

  describe("owner role permissions", () => {
    const membership = makeMembership({ role: "owner" });

    it("can perform all actions", () => {
      for (const action of getAllActions()) {
        expect(canPerformAction(ctx, action, membership)).toBe(true);
      }
    });
  });

  describe("convenience functions", () => {
    const memberMem = makeMembership({ role: "member" });
    const adminMem = makeMembership({ role: "admin" });
    const ownerMem = makeMembership({ role: "owner" });

    it("canAccessOrganization works for all roles", () => {
      expect(canAccessOrganization(ctx, memberMem)).toBe(true);
      expect(canAccessOrganization(ctx, adminMem)).toBe(true);
      expect(canAccessOrganization(ctx, ownerMem)).toBe(true);
      expect(canAccessOrganization(ctx, null)).toBe(false);
    });

    it("canManageOrganization requires admin+", () => {
      expect(canManageOrganization(ctx, memberMem)).toBe(false);
      expect(canManageOrganization(ctx, adminMem)).toBe(true);
      expect(canManageOrganization(ctx, ownerMem)).toBe(true);
    });

    it("canDeleteOrganization requires owner", () => {
      expect(canDeleteOrganization(ctx, memberMem)).toBe(false);
      expect(canDeleteOrganization(ctx, adminMem)).toBe(false);
      expect(canDeleteOrganization(ctx, ownerMem)).toBe(true);
    });

    it("canInviteMembers requires admin+", () => {
      expect(canInviteMembers(ctx, memberMem)).toBe(false);
      expect(canInviteMembers(ctx, adminMem)).toBe(true);
      expect(canInviteMembers(ctx, ownerMem)).toBe(true);
    });

    it("canRemoveMembers requires admin+", () => {
      expect(canRemoveMembers(ctx, memberMem)).toBe(false);
      expect(canRemoveMembers(ctx, adminMem)).toBe(true);
      expect(canRemoveMembers(ctx, ownerMem)).toBe(true);
    });

    it("canUpdateRoles requires owner", () => {
      expect(canUpdateRoles(ctx, memberMem)).toBe(false);
      expect(canUpdateRoles(ctx, adminMem)).toBe(false);
      expect(canUpdateRoles(ctx, ownerMem)).toBe(true);
    });

    it("canManageBilling requires owner", () => {
      expect(canManageBilling(ctx, memberMem)).toBe(false);
      expect(canManageBilling(ctx, adminMem)).toBe(false);
      expect(canManageBilling(ctx, ownerMem)).toBe(true);
    });

    it("canViewBilling requires admin+", () => {
      expect(canViewBilling(ctx, memberMem)).toBe(false);
      expect(canViewBilling(ctx, adminMem)).toBe(true);
      expect(canViewBilling(ctx, ownerMem)).toBe(true);
    });
  });

  describe("hasActiveSubscription", () => {
    it("returns false for null subscription", () => {
      expect(hasActiveSubscription(null)).toBe(false);
    });

    it("returns true for active subscription", () => {
      const sub: Subscription = {
        id: "sub_1",
        organizationId: "org_1",
        paddleSubscriptionId: "paddle_1",
        paddlePriceId: "price_1",
        status: "active",
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(hasActiveSubscription(sub)).toBe(true);
    });

    it("returns true for trialing subscription", () => {
      const sub: Subscription = {
        id: "sub_1",
        organizationId: "org_1",
        paddleSubscriptionId: "paddle_1",
        paddlePriceId: "price_1",
        status: "trialing",
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(hasActiveSubscription(sub)).toBe(true);
    });

    it("returns false for past_due subscription", () => {
      const sub: Subscription = {
        id: "sub_1",
        organizationId: "org_1",
        paddleSubscriptionId: "paddle_1",
        paddlePriceId: "price_1",
        status: "past_due",
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(hasActiveSubscription(sub)).toBe(false);
    });

    it("returns false for cancelled subscription", () => {
      const sub: Subscription = {
        id: "sub_1",
        organizationId: "org_1",
        paddleSubscriptionId: "paddle_1",
        paddlePriceId: "price_1",
        status: "cancelled",
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(hasActiveSubscription(sub)).toBe(false);
    });
  });

  describe("getAllActions and getMinimumRole", () => {
    it("returns all defined actions", () => {
      const actions = getAllActions();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions).toContain("org:read");
      expect(actions).toContain("org:delete");
      expect(actions).toContain("billing:manage");
    });

    it("getMinimumRole returns correct role for each action", () => {
      expect(getMinimumRole("org:read")).toBe("member");
      expect(getMinimumRole("org:update")).toBe("admin");
      expect(getMinimumRole("org:delete")).toBe("owner");
      expect(getMinimumRole("member:invite")).toBe("admin");
      expect(getMinimumRole("member:update_role")).toBe("owner");
      expect(getMinimumRole("billing:manage")).toBe("owner");
    });
  });
});
