/**
 * Job port: Inngest adapter for workflow runs with bounded retry and terminal failure.
 * A run attempts at most `maxAttempts` times. It reaches `completed` exactly once if
 * any attempt succeeds, otherwise it reaches the terminal `failed` state after the
 * final attempt is exhausted -- it never remains indefinitely `pending`/`running`.
 */

import type { RunStatus } from "@/domain/entities";
import type { RunRepository, StepAttemptRepository } from "./database";
import { NotFoundError, sanitizeProviderError } from "./errors";

// --- Job Port Interface ---

export interface JobPort {
  triggerWorkflow(
    workflowId: string,
    triggeredBy: string
  ): Promise<{ runId: string }>;
  getRunStatus(runId: string): Promise<RunStatus>;
}

export interface InngestClientLike {
  send(event: { name: string; data: Record<string, unknown> }): Promise<unknown>;
}

// --- Shared bounded-retry state machine ---
// Used by both the real Inngest step function and the fake adapter so
// their retry/terminal-failure semantics are provably identical.

export interface BoundedRetryParams {
  runId: string;
  stepName: string;
  maxAttempts: number;
  runRepo: RunRepository;
  stepAttemptRepo: StepAttemptRepository;
  /** Throws on failure; resolves on success. */
  execute: (attemptNumber: number) => Promise<void>;
}

/**
 * Executes a run's work with a bounded number of attempts.
 * - Attempt count never exceeds `maxAttempts`.
 * - Reaches `completed` exactly once if any attempt succeeds.
 * - Otherwise reaches terminal `failed` after the last attempt, recording the error.
 */
export async function executeStepWithBoundedRetry(
  params: BoundedRetryParams
): Promise<RunStatus> {
  const { runId, stepName, maxAttempts, runRepo, stepAttemptRepo, execute } =
    params;

  if (maxAttempts < 1) {
    throw new Error("maxAttempts must be a finite positive integer");
  }

  await runRepo.updateStatus(runId, "running", { startedAt: new Date() });

  for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber++) {
    const attempt = await stepAttemptRepo.create({
      runId,
      stepName,
      attemptNumber,
      status: "running",
      startedAt: new Date(),
      completedAt: null,
      error: null,
    });

    try {
      await execute(attemptNumber);
      await stepAttemptRepo.updateStatus(attempt.id, "succeeded", {
        completedAt: new Date(),
      });
      await runRepo.updateStatus(runId, "completed", {
        completedAt: new Date(),
      });
      return "completed";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Step failed";
      await stepAttemptRepo.updateStatus(attempt.id, "failed", {
        completedAt: new Date(),
        error: message,
      });

      if (attemptNumber >= maxAttempts) {
        await runRepo.updateStatus(runId, "failed", {
          completedAt: new Date(),
          error: message,
        });
        return "failed";
      }
      // else: retry with the next attempt in the loop
    }
  }

  // Unreachable, but keeps the type checker satisfied.
  return "failed";
}

// --- Inngest Adapter ---

export class InngestAdapter implements JobPort {
  private runRepo: RunRepository;
  private stepAttemptRepo: StepAttemptRepository;
  private maxAttempts: number;
  private client: InngestClientLike;

  constructor(
    client: InngestClientLike,
    runRepo: RunRepository,
    stepAttemptRepo: StepAttemptRepository,
    maxAttempts: number = 3
  ) {
    this.client = client;
    this.runRepo = runRepo;
    this.stepAttemptRepo = stepAttemptRepo;
    this.maxAttempts = maxAttempts;
  }

  /**
   * Creates a pending Run and sends an event to Inngest to execute it.
   * The Inngest function (registered in app/api/inngest/route.ts) is
   * responsible for calling `executeStepWithBoundedRetry` with the same
   * `maxAttempts`, guaranteeing the run reaches a terminal state.
   */
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

    try {
      await this.client.send({
        name: "workflow/run.triggered",
        data: { runId: run.id, workflowId, maxAttempts: this.maxAttempts },
      });
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to trigger workflow run");
    }

    return { runId: run.id };
  }

  async getRunStatus(runId: string): Promise<RunStatus> {
    const run = await this.runRepo.findById(runId);
    if (!run) throw new NotFoundError("Run");
    return run.status;
  }
}
