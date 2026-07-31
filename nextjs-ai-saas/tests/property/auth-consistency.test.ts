/**
 * Property 4: Authentication and access consistency.
 * For any identity state and protected resource, access is granted
 * iff authentication is valid AND policy authorizes.
 * Uses fast-check to generate random auth contexts and verify deny-by-default.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canAccessWorkspace,
  canManageWorkspace,
  canGenerate,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Workspace, Entitlement, EntitlementStatus } from "@/domain/entities";

// Arbitrary generators

const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });

const workspaceArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  slug: fc.string({ minLength: 1, maxLength: 30 }),
  ownerId: userIdArb,
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const entitlementStatusArb = fc.constantFrom<EntitlementStatus>(
  "active",
  "past_due",
  "cancelled",
  "trialing"
);

const entitlementArb = fc.record({
  id: fc.uuid(),
  workspaceId: fc.uuid(),
  lemonSqueezyCustomerId: fc.string({ minLength: 1, maxLength: 20 }),
  lemonSqueezySubscriptionId: fc.string({ minLength: 1, maxLength: 20 }),
  lemonSqueezyVariantId: fc.string({ minLength: 1, maxLength: 20 }),
  status: entitlementStatusArb,
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

describe("Property 4: Authentication and Access Consistency", () => {
  it("workspace access is granted iff authenticated AND owner", () => {
    fc.assert(
      fc.property(
        authContextArb,
        workspaceArb,
        (ctx: AuthContext, workspace: Workspace) => {
          const result = canAccessWorkspace(ctx, workspace);

          const isAuthenticated = ctx.userId.length > 0;
          const isOwner = workspace.ownerId === ctx.userId;

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isOwner) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("workspace management is granted only to authenticated owners", () => {
    fc.assert(
      fc.property(
        authContextArb,
        workspaceArb,
        (ctx: AuthContext, workspace: Workspace) => {
          const result = canManageWorkspace(ctx, workspace);

          const isAuthenticated = ctx.userId.length > 0;
          const isOwner = workspace.ownerId === ctx.userId;

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isOwner) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("generation requires authenticated owner with active/trialing entitlement", () => {
    fc.assert(
      fc.property(
        authContextArb,
        workspaceArb,
        entitlementArb,
        (ctx: AuthContext, workspace: Workspace, entitlement: Entitlement) => {
          const result = canGenerate(ctx, workspace, entitlement);

          const isAuthenticated = ctx.userId.length > 0;
          const isOwner = workspace.ownerId === ctx.userId;
          const isActiveStatus =
            entitlement.status === "active" ||
            entitlement.status === "trialing";

          if (!isAuthenticated) {
            expect(result).toBe(false);
          } else if (!isOwner) {
            expect(result).toBe(false);
          } else if (!isActiveStatus) {
            expect(result).toBe(false);
          } else {
            expect(result).toBe(true);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("generation with null entitlement always denied", () => {
    fc.assert(
      fc.property(
        authContextArb,
        workspaceArb,
        (ctx: AuthContext, workspace: Workspace) => {
          expect(canGenerate(ctx, workspace, null)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("deny-by-default: unauthenticated always denied for all policies", () => {
    fc.assert(
      fc.property(workspaceArb, entitlementArb, (workspace, entitlement) => {
        const unauthed = { userId: "" };
        expect(canAccessWorkspace(unauthed, workspace)).toBe(false);
        expect(canManageWorkspace(unauthed, workspace)).toBe(false);
        expect(canGenerate(unauthed, workspace, entitlement)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
