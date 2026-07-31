/**
 * Integration tests for authentication and access control.
 */

import { describe, it, expect } from "vitest";
import { requireAuth, getOptionalAuth } from "@/lib/server/auth";
import { AuthenticationError } from "@/lib/server/errors";
import { canCreateBooking, canManageProvider } from "@/domain/policies";
import type { Provider } from "@/domain/entities";

const provider: Provider = {
  id: "prov_1",
  userId: "user_provider",
  name: "Dr. Smith",
  email: "smith@test.com",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Authentication Integration", () => {
  describe("requireAuth", () => {
    it("returns AuthContext for valid session", () => {
      const ctx = requireAuth({ userId: "user_123", email: "test@test.com" });
      expect(ctx.userId).toBe("user_123");
    });

    it("throws AuthenticationError for null userId", () => {
      expect(() => requireAuth({ userId: null })).toThrow(AuthenticationError);
    });
  });

  describe("getOptionalAuth", () => {
    it("returns AuthContext for valid session", () => {
      const ctx = getOptionalAuth({ userId: "user_123" });
      expect(ctx).not.toBeNull();
      expect(ctx!.userId).toBe("user_123");
    });

    it("returns null for unauthenticated session", () => {
      const ctx = getOptionalAuth({ userId: null });
      expect(ctx).toBeNull();
    });
  });

  describe("Authenticated access to policies", () => {
    it("authenticated user can create bookings", () => {
      const ctx = requireAuth({ userId: "user_customer" });
      expect(canCreateBooking(ctx)).toBe(true);
    });

    it("unauthenticated user cannot create bookings", () => {
      const ctx = getOptionalAuth({ userId: null });
      expect(canCreateBooking(ctx)).toBe(false);
    });

    it("provider can manage their own profile", () => {
      const ctx = requireAuth({ userId: "user_provider" });
      expect(canManageProvider(ctx, provider)).toBe(true);
    });

    it("other user cannot manage provider profile", () => {
      const ctx = requireAuth({ userId: "other_user" });
      expect(canManageProvider(ctx, provider)).toBe(false);
    });
  });
});
