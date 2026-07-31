/**
 * Deterministic in-memory fake job adapter for testing.
 * Simulates the workflow-run lifecycle:
 *   pending -> running -> completed          (any scripted attempt succeeds)
 *   pending -> running -> ... -> failed       (all scripted attempts fail, terminal)
 * Every StepAttempt is recorded for assertions. The attempt count for a run
 * never exceeds the configured `maxAttempts`.
 */

import type { RunStatus } from "@/domain/entities";
import type { JobPort } from "./jobs";
import {
  InMemoryRunRepository,
  InMemoryStepAttemptRepository,
} from "./database";
import { executeStepWithBoundedRetry } from "./jobs";

export type StepOutcome = "succeed" | "fail";

export class FakeJobAdapter implements JobPort {
  public runRepo = new InMemoryRunRepository();
  public stepAttemptRepo = new InMemoryStepAttemptRepository();

  private maxAttempts: number;
  /** Maps runId -> scripted per-attempt outcomes (consumed in order). */
  private scripts: Map<string, StepOutcome[]> = new Map();
  /** Maps workflowId -> outcomes to use for the next triggered run. */
  private nextOutcomesByWorkflow: Map<string, StepOutcome[]> = new Map();

  constructor(maxAttempts: number = 3) {
    this.maxAttempts = maxAttempts;
  }

  /**
   * Script the outcome sequence used the next time this workflow is triggered.
   * If fewer outcomes than `maxAttempts` are provided, remaining attempts fail.
   */
  scriptNextRun(workflowId: string, outcomes: StepOutcome[]): void {
    this.nextOutcomesByWorkflow.set(workflowId, outcomes);
  }

  async triggerWorkflow(
    workflowId: string,
    triggeredBy: string
  ): Promise<{ runId: string }> {
    const run = await this.runRepo.create({
      workflowId,
      triggeredBy,
      status: "pending",
      startedAt: null,
      completedAt: null,
      error: null,
    });

    const outcomes = this.nextOutcomesByWorkflow.get(workflowId) ?? ["fail"];
    this.scripts.set(run.id, [...outcomes]);

    // Simulate the Inngest step function executing synchronously (deterministic for tests).
    await executeStepWithBoundedRetry({
      runId: run.id,
      stepName: "run-workflow",
      maxAttempts: this.maxAttempts,
      runRepo: this.runRepo,
      stepAttemptRepo: this.stepAttemptRepo,
      execute: async (attemptNumber) => {
        const script = this.scripts.get(run.id) ?? [];
        const outcome = script[attemptNumber - 1] ?? "fail";
        if (outcome === "fail") {
          throw new Error(`Simulated failure on attempt ${attemptNumber}`);
        }
      },
    });

    return { runId: run.id };
  }

  async getRunStatus(runId: string): Promise<RunStatus> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new Error("Run not found");
    return run.status;
  }

  /**
   * Reset all in-memory state (for between tests).
   */
  reset(): void {
    this.runRepo = new InMemoryRunRepository();
    this.stepAttemptRepo = new InMemoryStepAttemptRepository();
    this.scripts.clear();
    this.nextOutcomesByWorkflow.clear();
  }
}
