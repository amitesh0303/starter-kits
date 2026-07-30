/**
 * Property 4: Authentication and access consistency.
 * For any identity state and protected resource, access is granted
 * iff authentication is valid AND policy authorizes.
 * Uses fast-check to generate random auth contexts and verify deny-by-default.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canAccessTenant,
  canManageTenant,
  canManageMembers,
  canAccessProject,
} from "@/domain/policies";
import type { Membership, MembershipRole } from "@/domain/entities";
import type { AuthContext } from "@/domain/policies";

// Arbitrary generators

const roleArb = fc.constantFrom<MembershipRole>("owner", "admin", "member");

const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });

const membershipArb = fc.record({
  id: fc.uuid(),
  tenantId: fc.uuid(),
  userId: userIdArb,
  role: roleArb,
  createdAt: fc.date(),
});

const membershipsArb = fc.array(membershipArb, { minLength: 0, maxLength: 10 });

// Optionally null/empty userId to simulate unauthenticated
const authContextArb = fc.oneof(
  fc.record({ userId: userIdArb }),
  fc.constant({ userId: "" }) // unauthenticated
);

describe("Property 4: Authentication and Access Consistency", () => {
  it("access is granted iff authenticated AND authorized (canAccessTenant)", () => {
    fc.assert(
      fc.property(
        authContextArb,
        membershipsArb,
        (ctx: AuthContext, memberships: Membership[]) => {
          const result = canAccessTenant(ctx, memberships);

          const isAuthenticated = ctx.userId.length > 0;
          const isMember = memberships.some((m) => m.userId === ctx.userId);

          if (!isAuthenticated) {
            // Deny-by-default: unauthenticated always denied
            expect(result).toBe(false);
          } else if (!isMember) {
            // Authenticated but not a member: denied
            expect(result).toBe(false);
          } else {
            // Authenticated and is a member: granted
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("management is granted only to authenticated owners/admins (canManageTenant)", () => {
    fc.assert(
      fc.property(
        authContextArb,
        membershipsArb,
        (ctx: AuthContext, memberships: Membership[]) => {
          const result = canManageTenant(ctx, memberships);

          const isAuthenticated = ctx.userId.length > 0;
          const isManagerRole = memberships.some(
            (m) =>
              m.userId === ctx.userId &&
              (m.role === "owner" || m.role === "admin")
          );

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isManagerRole) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("member management is granted only to authenticated owners/admins (canManageMembers)", () => {
    fc.assert(
      fc.property(
        authContextArb,
        membershipsArb,
        (ctx: AuthContext, memberships: Membership[]) => {
          const result = canManageMembers(ctx, memberships);

          const isAuthenticated = ctx.userId.length > 0;
          const isManagerRole = memberships.some(
            (m) =>
              m.userId === ctx.userId &&
              (m.role === "owner" || m.role === "admin")
          );

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isManagerRole) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("project access is granted only to authenticated tenant members (canAccessProject)", () => {
    fc.assert(
      fc.property(
        authContextArb,
        membershipsArb,
        (ctx: AuthContext, memberships: Membership[]) => {
          const result = canAccessProject(ctx, memberships);

          const isAuthenticated = ctx.userId.length > 0;
          const isMember = memberships.some((m) => m.userId === ctx.userId);

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isMember) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("deny-by-default: empty memberships list always denies regardless of auth state", () => {
    fc.assert(
      fc.property(authContextArb, (ctx: AuthContext) => {
        expect(canAccessTenant(ctx, [])).toBe(false);
        expect(canManageTenant(ctx, [])).toBe(false);
        expect(canManageMembers(ctx, [])).toBe(false);
        expect(canAccessProject(ctx, [])).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
