/**
 * Integration tests for authentication.
 * Tests unauthenticated denial and unauthorized denial patterns.
 */

import { describe, it, expect } from "vitest";
import { requireAuth, getOptionalAuth } from "@/lib/server/auth";
import { AuthenticationError } from "@/lib/server/errors";
import { canAccessWorkspace, canGenerate } from "@/domain/policies";
import type { Workspace, Entitlement } from "@/domain/entities";

const workspace: Workspace = {
  id: "ws_1",
  name: "Test Workspace",
  slug: "test-workspace",
  ownerId: "user_1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const entitlement: Entitlement = {
  id: "ent_1",
  workspaceId: "ws_1",
  lemonSqueezyCustomerId: "cus_1",
  lemonSqueezySubscriptionId: "sub_1",
  lemonSqueezyVariantId: "var_1",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  cancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Authentication Integration", () => {
  describe("requireAuth", () => {
    it("throws AuthenticationError when userId is null", () => {
      expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
    });

    it("returns user when userId is present", () => {
      const user = requireAuth({ userId: "user_1" });
      expect(user.userId).toBe("user_1");
    });
  });

  describe("getOptionalAuth", () => {
    it("returns null when userId is null", () => {
      expect(getOptionalAuth({ userId: null })).toBeNull();
    });

    it("returns user when userId is present", () => {
      const user = getOptionalAuth({ userId: "user_1" });
      expect(user).not.toBeNull();
      expect(user!.userId).toBe("user_1");
    });
  });

  describe("Access flow", () => {
    it("unauthenticated user is denied access", () => {
      expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
    });

    it("authenticated non-owner is denied workspace access", () => {
      const user = requireAuth({ userId: "user_other" });
      expect(canAccessWorkspace({ userId: user.userId }, workspace)).toBe(false);
    });

    it("authenticated owner is granted workspace access", () => {
      const user = requireAuth({ userId: "user_1" });
      expect(canAccessWorkspace({ userId: user.userId }, workspace)).toBe(true);
    });

    it("authenticated owner with no entitlement is denied generation", () => {
      const user = requireAuth({ userId: "user_1" });
      expect(canGenerate({ userId: user.userId }, workspace, null)).toBe(false);
    });

    it("authenticated owner with active entitlement is granted generation", () => {
      const user = requireAuth({ userId: "user_1" });
      expect(canGenerate({ userId: user.userId }, workspace, entitlement)).toBe(true);
    });

    it("authenticated owner with cancelled entitlement is denied generation", () => {
      const user = requireAuth({ userId: "user_1" });
      const cancelledEnt = { ...entitlement, status: "cancelled" as const };
      expect(canGenerate({ userId: user.userId }, workspace, cancelledEnt)).toBe(false);
    });
  });
});
