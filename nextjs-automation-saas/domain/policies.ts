/**
 * Deny-by-default authorization policies for the Automation SaaS.
 * All access checks return false unless an explicit allow condition is met.
 * Includes plan gating: workflow creation and run triggering are bounded by
 * the caller's subscription limits.
 */

import type { Workflow, Subscription } from "./entities";

export interface AuthContext {
  userId: string;
}

/**
 * Check if the user can create a new workflow.
 * Requires authentication and being under the plan's workflow limit.
 */
export function canCreateWorkflow(
  ctx: AuthContext | null,
  currentWorkflowCount: number,
  planLimit: number
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return currentWorkflowCount < planLimit;
}

/**
 * Check if the user can edit a workflow (owner only).
 */
export function canEditWorkflow(
  ctx: AuthContext | null,
  workflow: Workflow
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === workflow.userId;
}

/**
 * Check if the user can trigger a run for a workflow.
 * Requires: workflow ownership, an active/trialing subscription, and being
 * under the subscription's monthly run limit.
 */
export function canTriggerRun(
  ctx: AuthContext | null,
  workflow: Workflow,
  subscription: Subscription | null,
  runsThisMonth: number
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  if (ctx.userId !== workflow.userId) return false;
  if (!subscription) return false;
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }
  return runsThisMonth < subscription.maxRunsPerMonth;
}

/**
 * Check if the user can view a run (workflow owner only).
 */
export function canViewRun(
  ctx: AuthContext | null,
  workflow: Workflow
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === workflow.userId;
}
