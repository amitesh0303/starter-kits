/**
 * Integration tests for authentication and authorization.
 * Tests unauthenticated denial, unauthorized denial, and role-based access.
 */

import { describe, it, expect } from "vitest";
import { requireAuth, getOptionalAuth, getOrgFromSession } from "@/lib/server/auth";
import { AuthenticationError } from "@/lib/server/errors";
import {
  canAccessOrganization,
  canManageOrganization,
  canDeleteOrganization,
  canInviteMembers,
  canManageBilling,
  findActiveMembership,
} from "@/domain/policies";
import type { Membership } from "@/domain/entities";

const memberships: Membership[] = [
  {
    id: "mem_owner",
    organizationId: "org_1",
    userId: "user_owner",
    email: "owner@example.com",
    role: "owner",
    status: "active",
    invitedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mem_admin",
    organizationId: "org_1",
    userId: "user_admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    invitedBy: "user_owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mem_member",
    organizationId: "org_1",
    userId: "user_member",
    email: "member@example.com",
    role: "member",
    status: "active",
    invitedBy: "user_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "mem_pending",
    organizationId: "org_1",
    userId: "user_pending",
    email: "pending@example.com",
    role: "member",
    status: "pending",
    invitedBy: "user_admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Authentication Integration", () => {
  describe("requireAuth", () => {
    it("throws AuthenticationError when userId is null", () => {
      expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
    });

    it("returns auth context when userId is present", () => {
      const ctx = requireAuth({ userId: "user_1" });
      expect(ctx.userId).toBe("user_1");
    });
  });

  describe("getOptionalAuth", () => {
    it("returns null when userId is null", () => {
      expect(getOptionalAuth({ userId: null })).toBeNull();
    });

    it("returns auth context when userId is present", () => {
      const ctx = getOptionalAuth({ userId: "user_1" });
      expect(ctx).not.toBeNull();
      expect(ctx!.userId).toBe("user_1");
    });
  });

  describe("getOrgFromSession", () => {
    it("returns null when no org context", () => {
      expect(getOrgFromSession({ userId: "user_1" })).toBeNull();
    });

    it("returns org ID when present", () => {
      expect(getOrgFromSession({ userId: "user_1", orgId: "org_1" })).toBe("org_1");
    });
  });

  describe("Access flow - unauthenticated denial", () => {
    it("requireAuth throws for unauthenticated user", () => {
      expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
    });
  });

  describe("Access flow - unauthorized denial", () => {
    it("non-member cannot access organization", () => {
      const ctx = requireAuth({ userId: "user_stranger" });
      const membership = findActiveMembership(ctx, "org_1", memberships);
      expect(membership).toBeNull();
      expect(canAccessOrganization(ctx, membership)).toBe(false);
    });

    it("pending member cannot access organization", () => {
      const ctx = requireAuth({ userId: "user_pending" });
      const membership = findActiveMembership(ctx, "org_1", memberships);
      expect(membership).toBeNull(); // pending members have status !== active
      expect(canAccessOrganization(ctx, membership)).toBe(false);
    });
  });

  describe("Access flow - role-based access", () => {
    it("member can access but not manage organization", () => {
      const ctx = requireAuth({ userId: "user_member" });
      const membership = findActiveMembership(ctx, "org_1", memberships);
      expect(membership).not.toBeNull();
      expect(canAccessOrganization(ctx, membership)).toBe(true);
      expect(canManageOrganization(ctx, membership)).toBe(false);
      expect(canDeleteOrganization(ctx, membership)).toBe(false);
    });

    it("admin can access and manage but not delete organization", () => {
      const ctx = requireAuth({ userId: "user_admin" });
      const membership = findActiveMembership(ctx, "org_1", memberships);
      expect(membership).not.toBeNull();
      expect(canAccessOrganization(ctx, membership)).toBe(true);
      expect(canManageOrganization(ctx, membership)).toBe(true);
      expect(canDeleteOrganization(ctx, membership)).toBe(false);
      expect(canInviteMembers(ctx, membership)).toBe(true);
    });

    it("owner can perform all actions", () => {
      const ctx = requireAuth({ userId: "user_owner" });
      const membership = findActiveMembership(ctx, "org_1", memberships);
      expect(membership).not.toBeNull();
      expect(canAccessOrganization(ctx, membership)).toBe(true);
      expect(canManageOrganization(ctx, membership)).toBe(true);
      expect(canDeleteOrganization(ctx, membership)).toBe(true);
      expect(canInviteMembers(ctx, membership)).toBe(true);
      expect(canManageBilling(ctx, membership)).toBe(true);
    });
  });
});
