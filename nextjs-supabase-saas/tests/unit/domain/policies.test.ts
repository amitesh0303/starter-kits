/**
 * Unit tests for authorization policies.
 * Verifies deny-by-default behavior and role-based access.
 */

import { describe, it, expect } from "vitest";
import {
  canAccessTenant,
  canManageTenant,
  canAccessProject,
  canManageMembers,
} from "@/domain/policies";
import type { Membership } from "@/domain/entities";

function makeMembership(
  userId: string,
  role: "owner" | "admin" | "member"
): Membership {
  return {
    id: `mem_${userId}`,
    tenantId: "tenant_1",
    userId,
    role,
    createdAt: new Date(),
  };
}

describe("Authorization Policies", () => {
  const ownerMembership = makeMembership("user_owner", "owner");
  const adminMembership = makeMembership("user_admin", "admin");
  const memberMembership = makeMembership("user_member", "member");
  const allMemberships = [ownerMembership, adminMembership, memberMembership];

  describe("canAccessTenant", () => {
    it("grants access to an owner", () => {
      const ctx = { userId: "user_owner" };
      expect(canAccessTenant(ctx, allMemberships)).toBe(true);
    });

    it("grants access to an admin", () => {
      const ctx = { userId: "user_admin" };
      expect(canAccessTenant(ctx, allMemberships)).toBe(true);
    });

    it("grants access to a member", () => {
      const ctx = { userId: "user_member" };
      expect(canAccessTenant(ctx, allMemberships)).toBe(true);
    });

    it("denies access to a non-member", () => {
      const ctx = { userId: "user_stranger" };
      expect(canAccessTenant(ctx, allMemberships)).toBe(false);
    });

    it("denies access to unauthenticated user (empty userId)", () => {
      const ctx = { userId: "" };
      expect(canAccessTenant(ctx, allMemberships)).toBe(false);
    });

    it("denies access when memberships list is empty", () => {
      const ctx = { userId: "user_owner" };
      expect(canAccessTenant(ctx, [])).toBe(false);
    });
  });

  describe("canManageTenant", () => {
    it("grants management access to an owner", () => {
      const ctx = { userId: "user_owner" };
      expect(canManageTenant(ctx, allMemberships)).toBe(true);
    });

    it("grants management access to an admin", () => {
      const ctx = { userId: "user_admin" };
      expect(canManageTenant(ctx, allMemberships)).toBe(true);
    });

    it("denies management access to a member", () => {
      const ctx = { userId: "user_member" };
      expect(canManageTenant(ctx, allMemberships)).toBe(false);
    });

    it("denies management access to a non-member", () => {
      const ctx = { userId: "user_stranger" };
      expect(canManageTenant(ctx, allMemberships)).toBe(false);
    });

    it("denies management access to unauthenticated user", () => {
      const ctx = { userId: "" };
      expect(canManageTenant(ctx, allMemberships)).toBe(false);
    });
  });

  describe("canAccessProject", () => {
    it("grants project access to any tenant member", () => {
      const ctx = { userId: "user_member" };
      expect(canAccessProject(ctx, allMemberships)).toBe(true);
    });

    it("denies project access to a non-member", () => {
      const ctx = { userId: "user_stranger" };
      expect(canAccessProject(ctx, allMemberships)).toBe(false);
    });

    it("denies project access to unauthenticated user", () => {
      const ctx = { userId: "" };
      expect(canAccessProject(ctx, allMemberships)).toBe(false);
    });
  });

  describe("canManageMembers", () => {
    it("grants member management to an owner", () => {
      const ctx = { userId: "user_owner" };
      expect(canManageMembers(ctx, allMemberships)).toBe(true);
    });

    it("grants member management to an admin", () => {
      const ctx = { userId: "user_admin" };
      expect(canManageMembers(ctx, allMemberships)).toBe(true);
    });

    it("denies member management to a regular member", () => {
      const ctx = { userId: "user_member" };
      expect(canManageMembers(ctx, allMemberships)).toBe(false);
    });

    it("denies member management to a non-member", () => {
      const ctx = { userId: "user_stranger" };
      expect(canManageMembers(ctx, allMemberships)).toBe(false);
    });

    it("denies member management to unauthenticated user", () => {
      const ctx = { userId: "" };
      expect(canManageMembers(ctx, allMemberships)).toBe(false);
    });
  });
});
