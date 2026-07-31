/**
 * Integration test: create a workflow, trigger a run, and confirm the run
 * reaches a terminal state (completed or failed).
 */

import { describe, it, expect } from "vitest";
import { InMemoryWorkflowRepository } from "@/lib/server/database";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";
import { canCreateWorkflow, canTriggerRun } from "@/domain/policies";
import type { Subscription } from "@/domain/entities";

describe("Workflow create -> trigger run -> terminal state", () => {
  it("creates a workflow for an authorized user under the plan limit", async () => {
    const workflows = new InMemoryWorkflowRepository();
    const ctx = { userId: "user_1" };

    const currentCount = (await workflows.findByUserId(ctx.userId)).length;
    expect(canCreateWorkflow(ctx, currentCount, 5)).toBe(true);

    const workflow = await workflows.create({
      userId: ctx.userId,
      name: "Daily report",
      description: "Sends a daily report",
      triggerType: "scheduled",
      isActive: true,
    });

    expect(workflow.id).toBeTruthy();
    expect(workflow.userId).toBe(ctx.userId);
  });

  it("triggers a run that reaches completed when the subscription allows it", async () => {
    const workflows = new InMemoryWorkflowRepository();
    const jobs = new FakeJobAdapter(3);
    const ctx = { userId: "user_1" };

    const workflow = await workflows.create({
      userId: ctx.userId,
      name: "Sync data",
      description: null,
      triggerType: "manual",
      isActive: true,
    });

    const subscription: Subscription = {
      id: "sub_1",
      userId: ctx.userId,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      stripePriceId: "price_1",
      status: "active",
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      maxRunsPerMonth: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(canTriggerRun(ctx, workflow, subscription, 0)).toBe(true);

    jobs.scriptNextRun(workflow.id, ["succeed"]);
    const { runId } = await jobs.triggerWorkflow(workflow.id, ctx.userId);
    const status = await jobs.getRunStatus(runId);

    expect(status).toBe("completed");
  });

  it("run reaches terminal failed state after exhausting retries", async () => {
    const workflows = new InMemoryWorkflowRepository();
    const jobs = new FakeJobAdapter(3);
    const ctx = { userId: "user_1" };

    const workflow = await workflows.create({
      userId: ctx.userId,
      name: "Flaky integration",
      description: null,
      triggerType: "webhook",
      isActive: true,
    });

    jobs.scriptNextRun(workflow.id, ["fail", "fail", "fail"]);
    const { runId } = await jobs.triggerWorkflow(workflow.id, ctx.userId);
    const status = await jobs.getRunStatus(runId);

    expect(status).toBe("failed");
    const run = await jobs.runRepo.findById(runId);
    expect(run?.status).toBe("failed");
  });

  it("denies triggering a run when the caller does not own the workflow", async () => {
    const workflows = new InMemoryWorkflowRepository();
    const workflow = await workflows.create({
      userId: "owner",
      name: "Private workflow",
      description: null,
      triggerType: "manual",
      isActive: true,
    });

    const subscription: Subscription = {
      id: "sub_1",
      userId: "owner",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      stripePriceId: "price_1",
      status: "active",
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      maxRunsPerMonth: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(
      canTriggerRun({ userId: "intruder" }, workflow, subscription, 0)
    ).toBe(false);
  });
});
