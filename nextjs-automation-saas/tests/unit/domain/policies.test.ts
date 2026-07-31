/**
 * Unit tests for domain policies: plan gating and ownership checks.
 */

import { describe, it, expect } from "vitest";
import {
  canCreateWorkflow,
  canEditWorkflow,
  canTriggerRun,
  canViewRun,
} from "@/domain/policies";
import type { Workflow, Subscription } from "@/domain/entities";

const workflow: Workflow = {
  id: "wf_1",
  userId: "user_1",
  name: "Test workflow",
  description: null,
  triggerType: "manual",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const activeSubscription: Subscription = {
  id: "sub_1",
  userId: "user_1",
  stripeCustomerId: "cus_1",
  stripeSubscriptionId: "sub_1",
  stripePriceId: "price_1",
  status: "active",
  currentPeriodEnd: new Date(),
  cancelAtPeriodEnd: false,
  maxRunsPerMonth: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("canCreateWorkflow", () => {
  it("denies unauthenticated (null context)", () => {
    expect(canCreateWorkflow(null, 0, 10)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canCreateWorkflow({ userId: "" }, 0, 10)).toBe(false);
  });

  it("allows when under plan limit", () => {
    expect(canCreateWorkflow({ userId: "user_1" }, 3, 10)).toBe(true);
  });

  it("denies when at plan limit", () => {
    expect(canCreateWorkflow({ userId: "user_1" }, 10, 10)).toBe(false);
  });

  it("denies when over plan limit", () => {
    expect(canCreateWorkflow({ userId: "user_1" }, 11, 10)).toBe(false);
  });
});

describe("canEditWorkflow", () => {
  it("denies unauthenticated", () => {
    expect(canEditWorkflow(null, workflow)).toBe(false);
  });

  it("allows the owner", () => {
    expect(canEditWorkflow({ userId: "user_1" }, workflow)).toBe(true);
  });

  it("denies a non-owner", () => {
    expect(canEditWorkflow({ userId: "user_2" }, workflow)).toBe(false);
  });
});

describe("canTriggerRun", () => {
  it("denies unauthenticated", () => {
    expect(canTriggerRun(null, workflow, activeSubscription, 0)).toBe(false);
  });

  it("denies a non-owner", () => {
    expect(
      canTriggerRun({ userId: "user_2" }, workflow, activeSubscription, 0)
    ).toBe(false);
  });

  it("denies when there is no subscription", () => {
    expect(canTriggerRun({ userId: "user_1" }, workflow, null, 0)).toBe(false);
  });

  it("denies when subscription is cancelled", () => {
    const cancelled: Subscription = { ...activeSubscription, status: "cancelled" };
    expect(canTriggerRun({ userId: "user_1" }, workflow, cancelled, 0)).toBe(
      false
    );
  });

  it("denies when subscription is past_due", () => {
    const pastDue: Subscription = { ...activeSubscription, status: "past_due" };
    expect(canTriggerRun({ userId: "user_1" }, workflow, pastDue, 0)).toBe(
      false
    );
  });

  it("allows when subscription is trialing and under run limit", () => {
    const trialing: Subscription = { ...activeSubscription, status: "trialing" };
    expect(canTriggerRun({ userId: "user_1" }, workflow, trialing, 0)).toBe(
      true
    );
  });

  it("allows when active and under monthly run limit", () => {
    expect(
      canTriggerRun({ userId: "user_1" }, workflow, activeSubscription, 50)
    ).toBe(true);
  });

  it("denies when at the monthly run limit", () => {
    expect(
      canTriggerRun({ userId: "user_1" }, workflow, activeSubscription, 100)
    ).toBe(false);
  });

  it("denies when over the monthly run limit", () => {
    expect(
      canTriggerRun({ userId: "user_1" }, workflow, activeSubscription, 101)
    ).toBe(false);
  });
});

describe("canViewRun", () => {
  it("denies unauthenticated", () => {
    expect(canViewRun(null, workflow)).toBe(false);
  });

  it("allows the owner", () => {
    expect(canViewRun({ userId: "user_1" }, workflow)).toBe(true);
  });

  it("denies a non-owner", () => {
    expect(canViewRun({ userId: "user_2" }, workflow)).toBe(false);
  });
});
