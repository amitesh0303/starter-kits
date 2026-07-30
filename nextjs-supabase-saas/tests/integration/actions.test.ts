/**
 * Integration tests for server actions with policy enforcement.
 * Tests: create tenant (authenticated), create project (tenant membership),
 * invite member (owner/admin role required).
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
 * Simulates the server action authorization flow:
 * 1. Require authentication
 * 2. Load memberships for the relevant tenant
 * 3. Check policy
 */
interface ActionResult {
  success: boolean;
  error?: Error;
}

function simulateCreateTenantAction(
  session: { userId: string } | null
): ActionResult {
  // Create tenant only requires authentication (anyone authenticated can create)
  if (!session || !session.userId) {
    return { success: false, error: new AuthenticationError() };
  }
  return { success: true };
}

function simulateCreateProjectAction(
  session: { userId: string } | null,
  tenantMemberships: Membership[]
): ActionResult {
  if (!session || !session.userId) {
    return { success: false, error: new AuthenticationError() };
  }

  const ctx: AuthContext = { userId: session.userId };
  if (!canAccessTenant(ctx, tenantMemberships)) {
    return { success: false, error: new AuthorizationError() };
  }

  return { success: true };
}

function simulateInviteMemberAction(
  session: { userId: string } | null,
  tenantMemberships: Membership[]
): ActionResult {
  if (!session || !session.userId) {
    return { success: false, error: new AuthenticationError() };
  }

  const ctx: AuthContext = { userId: session.userId };
  if (!canManageMembers(ctx, tenantMemberships)) {
    return {
      success: false,
      error: new AuthorizationError("Only owners and admins can invite members"),
    };
  }

  return { success: true };
}

describe("Server Actions with Policies", () => {
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
      userId: "user_admin",
      role: "admin",
      createdAt: new Date(),
    },
    {
      id: "mem_3",
      tenantId: "tenant_1",
      userId: "user_member",
      role: "member",
      createdAt: new Date(),
    },
  ];

  describe("Create Tenant Action", () => {
    it("succeeds for an authenticated user", () => {
      const result = simulateCreateTenantAction({ userId: "user_new" });
      expect(result.success).toBe(true);
    });

    it("fails for unauthenticated user", () => {
      const result = simulateCreateTenantAction(null);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });
  });

  describe("Create Project Action", () => {
    it("succeeds for a tenant member", () => {
      const result = simulateCreateProjectAction(
        { userId: "user_member" },
        tenantMemberships
      );
      expect(result.success).toBe(true);
    });

    it("enforces tenant membership - denies non-members", () => {
      const result = simulateCreateProjectAction(
        { userId: "user_outsider" },
        tenantMemberships
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("fails for unauthenticated user", () => {
      const result = simulateCreateProjectAction(null, tenantMemberships);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });
  });

  describe("Invite Member Action", () => {
    it("succeeds for an owner", () => {
      const result = simulateInviteMemberAction(
        { userId: "user_owner" },
        tenantMemberships
      );
      expect(result.success).toBe(true);
    });

    it("succeeds for an admin", () => {
      const result = simulateInviteMemberAction(
        { userId: "user_admin" },
        tenantMemberships
      );
      expect(result.success).toBe(true);
    });

    it("enforces owner/admin role - denies regular members", () => {
      const result = simulateInviteMemberAction(
        { userId: "user_member" },
        tenantMemberships
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("enforces owner/admin role - denies non-members", () => {
      const result = simulateInviteMemberAction(
        { userId: "user_outsider" },
        tenantMemberships
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthorizationError);
    });

    it("fails for unauthenticated user", () => {
      const result = simulateInviteMemberAction(null, tenantMemberships);
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(AuthenticationError);
    });
  });
});
