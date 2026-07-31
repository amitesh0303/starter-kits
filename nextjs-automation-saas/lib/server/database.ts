/**
 * Database repository layer using Drizzle ORM.
 * Provides typed access to workflows, runs, step attempts, and subscriptions.
 * In test/development, use in-memory fakes below.
 */

import type {
  Workflow,
  Run,
  StepAttempt,
  Subscription,
  ProcessedEvent,
  RunStatus,
  StepStatus,
} from "@/domain/entities";

// --- Repository Interfaces ---

export interface WorkflowRepository {
  findById(id: string): Promise<Workflow | null>;
  findByUserId(userId: string): Promise<Workflow[]>;
  create(
    workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow>;
  update(
    id: string,
    data: Partial<Pick<Workflow, "name" | "description" | "isActive">>
  ): Promise<Workflow | null>;
  delete(id: string): Promise<void>;
}

export interface RunRepository {
  findById(id: string): Promise<Run | null>;
  findByWorkflowId(workflowId: string): Promise<Run[]>;
  countByWorkflowIdSince(workflowId: string, since: Date): Promise<number>;
  create(run: Omit<Run, "id" | "createdAt">): Promise<Run>;
  updateStatus(
    id: string,
    status: RunStatus,
    data?: Partial<Pick<Run, "startedAt" | "completedAt" | "error">>
  ): Promise<Run | null>;
}

export interface StepAttemptRepository {
  findByRunId(runId: string): Promise<StepAttempt[]>;
  create(attempt: Omit<StepAttempt, "id" | "createdAt">): Promise<StepAttempt>;
  updateStatus(
    id: string,
    status: StepStatus,
    data?: Partial<Pick<StepAttempt, "startedAt" | "completedAt" | "error">>
  ): Promise<StepAttempt | null>;
}

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>;
  create(
    sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription>;
  updateStatus(
    id: string,
    status: Subscription["status"]
  ): Promise<Subscription | null>;
}

export interface EventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(event: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent>;
}

// --- In-Memory Fake Repositories (for testing) ---

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private workflows: Map<string, Workflow> = new Map();

  async findById(id: string): Promise<Workflow | null> {
    return this.workflows.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (w) => w.userId === userId
    );
  }

  async create(
    data: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> {
    const workflow: Workflow = {
      ...data,
      id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async update(
    id: string,
    data: Partial<Pick<Workflow, "name" | "description" | "isActive">>
  ): Promise<Workflow | null> {
    const workflow = this.workflows.get(id);
    if (!workflow) return null;
    const updated = { ...workflow, ...data, updatedAt: new Date() };
    this.workflows.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.workflows.delete(id);
  }
}

export class InMemoryRunRepository implements RunRepository {
  private runs: Map<string, Run> = new Map();

  async findById(id: string): Promise<Run | null> {
    return this.runs.get(id) ?? null;
  }

  async findByWorkflowId(workflowId: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter(
      (r) => r.workflowId === workflowId
    );
  }

  async countByWorkflowIdSince(
    workflowId: string,
    since: Date
  ): Promise<number> {
    return Array.from(this.runs.values()).filter(
      (r) => r.workflowId === workflowId && r.createdAt >= since
    ).length;
  }

  async create(data: Omit<Run, "id" | "createdAt">): Promise<Run> {
    const run: Run = {
      ...data,
      id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.runs.set(run.id, run);
    return run;
  }

  async updateStatus(
    id: string,
    status: RunStatus,
    data?: Partial<Pick<Run, "startedAt" | "completedAt" | "error">>
  ): Promise<Run | null> {
    const run = this.runs.get(id);
    if (!run) return null;
    const updated = { ...run, ...data, status };
    this.runs.set(id, updated);
    return updated;
  }
}

export class InMemoryStepAttemptRepository implements StepAttemptRepository {
  private attempts: Map<string, StepAttempt> = new Map();

  async findByRunId(runId: string): Promise<StepAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      (a) => a.runId === runId
    );
  }

  async create(
    data: Omit<StepAttempt, "id" | "createdAt">
  ): Promise<StepAttempt> {
    const attempt: StepAttempt = {
      ...data,
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  async updateStatus(
    id: string,
    status: StepStatus,
    data?: Partial<Pick<StepAttempt, "startedAt" | "completedAt" | "error">>
  ): Promise<StepAttempt | null> {
    const attempt = this.attempts.get(id);
    if (!attempt) return null;
    const updated = { ...attempt, ...data, status };
    this.attempts.set(id, updated);
    return updated;
  }
}

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  async findByUserId(userId: string): Promise<Subscription | null> {
    for (const s of this.subscriptions.values()) {
      if (s.userId === userId) return s;
    }
    return null;
  }

  async create(
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription> {
    const sub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  async updateStatus(
    id: string,
    status: Subscription["status"]
  ): Promise<Subscription | null> {
    const s = this.subscriptions.get(id);
    if (!s) return null;
    const updated = { ...s, status, updatedAt: new Date() };
    this.subscriptions.set(id, updated);
    return updated;
  }
}

export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, ProcessedEvent> = new Map();

  async exists(providerEventId: string): Promise<boolean> {
    for (const e of this.events.values()) {
      if (e.providerEventId === providerEventId) return true;
    }
    return false;
  }

  async create(
    data: Omit<ProcessedEvent, "id" | "processedAt">
  ): Promise<ProcessedEvent> {
    const event: ProcessedEvent = {
      ...data,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      processedAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }
}
