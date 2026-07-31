/**
 * Feature: multi-stack-boilerplates, Property 4: Authentication and access consistency.
 * For any identity state and resource ownership:
 * - Unauthenticated access is always denied
 * - Unauthorized access (wrong user) is always denied
 * - Valid access requires authentication AND correct ownership AND plan gating
 * Uses fast-check to generate random auth contexts and entities.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canCreateWorkflow,
  canEditWorkflow,
  canTriggerRun,
  canViewRun,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Workflow, Subscription, SubscriptionStatus } from "@/domain/entities";

const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });

const workflowArb = (ownerUserId: string) =>
  fc.record({
    id: fc.uuid(),
    userId: fc.constant(ownerUserId),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    description: fc.option(fc.string(), { nil: null }),
    triggerType: fc.constantFrom<"manual" | "scheduled" | "webhook">(
      "manual",
      "scheduled",
      "webhook"
    ),
    isActive: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

const subscriptionStatusArb = fc.constantFrom<SubscriptionStatus>(
  "active",
  "past_due",
  "cancelled",
  "trialing"
);

function makeSubscription(
  userId: string,
  status: SubscriptionStatus,
  maxRunsPerMonth: number
): Subscription {
  return {
    id: "sub_1",
    userId,
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    stripePriceId: "price_1",
    status,
    currentPeriodEnd: new Date(),
    cancelAtPeriodEnd: false,
    maxRunsPerMonth,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Property 4: Authentication and Access Consistency", () => {
  it("unauthenticated (null context) always denied for canCreateWorkflow", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        (count, limit) => {
          expect(canCreateWorkflow(null, count, limit)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("unauthenticated (empty userId) always denied for canCreateWorkflow", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        (count, limit) => {
          expect(canCreateWorkflow({ userId: "" }, count, limit)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("canCreateWorkflow is granted iff authenticated AND under plan limit", () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.integer({ min: 0, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        (userId, count, limit) => {
          const ctx: AuthContext = { userId };
          const result = canCreateWorkflow(ctx, count, limit);
          const expected = userId.length > 0 && count < limit;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("unauthenticated always denied for canEditWorkflow and canViewRun", () => {
    fc.assert(
      fc.property(userIdArb, workflowArb("owner_x"), (_ignored, workflow) => {
        expect(canEditWorkflow(null, workflow)).toBe(false);
        expect(canEditWorkflow({ userId: "" }, workflow)).toBe(false);
        expect(canViewRun(null, workflow)).toBe(false);
        expect(canViewRun({ userId: "" }, workflow)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("only the workflow owner can edit or view runs", () => {
    fc.assert(
      fc.property(
        userIdArb,
        userIdArb,
        (ownerUserId, callerUserId) => {
          fc.pre(ownerUserId.length > 0);
          const workflow: Workflow = {
            id: "wf_1",
            userId: ownerUserId,
            name: "Test",
            description: null,
            triggerType: "manual",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const ctx: AuthContext = { userId: callerUserId };
          const expected = callerUserId === ownerUserId;
          expect(canEditWorkflow(ctx, workflow)).toBe(expected);
          expect(canViewRun(ctx, workflow)).toBe(expected);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("canTriggerRun requires ownership, active/trialing subscription, and under monthly run limit", () => {
    fc.assert(
      fc.property(
        userIdArb,
        userIdArb,
        subscriptionStatusArb,
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (ownerUserId, callerUserId, status, maxRunsPerMonth, runsThisMonth) => {
          fc.pre(ownerUserId.length > 0 && callerUserId.length > 0);
          const workflow: Workflow = {
            id: "wf_1",
            userId: ownerUserId,
            name: "Test",
            description: null,
            triggerType: "manual",
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const subscription = makeSubscription(
            ownerUserId,
            status,
            maxRunsPerMonth
          );
          const ctx: AuthContext = { userId: callerUserId };
          const result = canTriggerRun(
            ctx,
            workflow,
            subscription,
            runsThisMonth
          );
          const expected =
            callerUserId === ownerUserId &&
            (status === "active" || status === "trialing") &&
            runsThisMonth < maxRunsPerMonth;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("canTriggerRun always denied when there is no subscription", () => {
    fc.assert(
      fc.property(userIdArb, fc.integer({ min: 0, max: 50 }), (userId, runs) => {
        fc.pre(userId.length > 0);
        const workflow: Workflow = {
          id: "wf_1",
          userId,
          name: "Test",
          description: null,
          triggerType: "manual",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(canTriggerRun({ userId }, workflow, null, runs)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
