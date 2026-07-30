/**
 * Integration tests for authentication flow enforcement.
 * Tests: unauthenticated access denied, authenticated access succeeds,
 * tenant-scoped access enforcement via policies.
 */

import { describe, it, expect } from "vitest";
import {
  canAccessTenant,
  canManageTenant,
  canManageMembers,
} from "@/domain/policies";
import { AuthenticationError, AuthorizationError } from "@/lib/server/errors";
import type { Membership } from "@/domain/entities";
import type { AuthContext } from "@/domain/policies";

/**
 * Simulates the authentication + authorization check that server actions perform.
 * This tests the actual policy logic used in the application.
 */
function requireAuthAndAccess(
  session: { userId: string } | null,
  memberships: Membership[],
  action: "read" | "manage" | "manage_members"
): { allowed: boolean; error?: Error } {
  // Step 1: Authentication check
  if (!session || !session.userId) {
    return { allowed: false, error: new AuthenticationError() };
  }

  const ctx: AuthContext = { userId: session.userId };

  // Step 2: Authorization check
  let authorized = false;
  switch (action) {
    case "read":
      authorized = canAccessTenant(ctx, memberships);
      break;
    case "manage":
      authorized = canManageTenant(ctx, memberships);
      break;
    case "manage_members":
      authorized = canManageMembers(ctx, memberships);
      break;
  }

  if (!authorized) {
    return { allowed: false, error: new AuthorizationError() };
  }

  return { allowed: true };
}

describe("Auth Flow Enforcement", () => {
  const tenantMemberships: Membership[] = [
    {
      id: "mem_1",
      tenantId: "tenant_1",
      userId: "user_owner",
      role: "owner",
      createdAt: new Date(),
    },
    {
      id: "mem_2",
      tenantId: "tenant_1",
      userId: "user_member",
      role: "member",
      createdAt: new Date(),
    },
  ];

  describe("Unauthenticated Access", () => {
    it("returns 401 error for null session", () => {
      const result = requireAuthAndAccess(null, tenantMemberships, "read");
      expect(result.allowed).toBe(false);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });

    it("returns 401 error for empty userId", () => {
      const result = requireAuthAndAccess(
        { userId: "" },
        tenantMemberships,
        "read"
      );
      expect(result.allowed).toBe(false);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });
  });

  describe("Authenticated Access", () => {
    it("succeeds for a user who is a member of the tenant", () => {
      const result = requireAuthAndAccess(
        { userId: "user_member" },
        tenantMemberships,
        "read"
      );
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("succeeds for a user who is the owner of the tenant", () => {
      const result = requireAuthAndAccess(
        { userId: "user_owner" },
        tenantMemberships,
        "manage"
      );
      expect(result.allowed).toBe(true);
    });
  });

  describe("Tenant-scoped Access Enforcement", () => {
    it("denies read access to a user not in the tenant", () => {
      const result = requireAuthAndAccess(
        { userId: "user_outsider" },
        tenantMemberships,
        "read"
      );
      expect(result.allowed).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("denies manage access to a regular member", () => {
      const result = requireAuthAndAccess(
        { userId: "user_member" },
        tenantMemberships,
        "manage"
      );
      expect(result.allowed).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("denies member management to a regular member", () => {
      const result = requireAuthAndAccess(
        { userId: "user_member" },
        tenantMemberships,
        "manage_members"
      );
      expect(result.allowed).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("allows member management by the owner", () => {
      const result = requireAuthAndAccess(
        { userId: "user_owner" },
        tenantMemberships,
        "manage_members"
      );
      expect(result.allowed).toBe(true);
    });
  });
});
