/**
 * Domain entity types for the Automation SaaS application.
 * Core business objects: workflows, triggers, runs, step attempts, subscriptions, and events.
 */

export type TriggerType = "manual" | "scheduled" | "webhook";

export type RunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type StepStatus = "pending" | "running" | "succeeded" | "failed";

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  triggerType: TriggerType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trigger {
  id: string;
  workflowId: string;
  type: TriggerType;
  config: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Run {
  id: string;
  workflowId: string;
  triggeredBy: string;
  status: RunStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface StepAttempt {
  id: string;
  runId: string;
  stepName: string;
  attemptNumber: number;
  status: StepStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  maxRunsPerMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processedAt: Date;
}
