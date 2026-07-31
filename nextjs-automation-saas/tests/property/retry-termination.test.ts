/**
 * Feature: multi-stack-boilerplates, Property 8: Job retry termination.
 * For any finite positive retry limit and any sequence of retryable outcomes,
 * a job attempts no more than the configured limit, succeeds exactly once when
 * an attempt succeeds, and otherwise records terminal failure after exhaustion
 * without remaining indefinitely queued or retrying.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";
import type { StepOutcome } from "@/lib/server/jobs-fake";

const outcomeArb = fc.constantFrom<StepOutcome>("succeed", "fail");
const maxAttemptsArb = fc.integer({ min: 1, max: 10 });

describe("Property 8: Job Retry Termination", () => {
  it("attempts never exceed maxAttempts, and the run always reaches a terminal state", async () => {
    await fc.assert(
      fc.asyncProperty(
        maxAttemptsArb,
        fc.array(outcomeArb, { minLength: 1, maxLength: 15 }),
        async (maxAttempts, outcomes) => {
          const jobs = new FakeJobAdapter(maxAttempts);
          jobs.scriptNextRun("wf_1", outcomes);

          const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
          const status = await jobs.getRunStatus(runId);
          const attempts = await jobs.stepAttemptRepo.findByRunId(runId);

          // Attempt count never exceeds maxAttempts.
          expect(attempts.length).toBeLessThanOrEqual(maxAttempts);

          // Run always reaches a terminal state, never stuck pending/running.
          expect(["completed", "failed"]).toContain(status);

          const firstSuccessIndex = outcomes
            .slice(0, maxAttempts)
            .findIndex((o) => o === "succeed");

          if (firstSuccessIndex !== -1) {
            // Succeeds exactly once: terminal state is completed, and the
            // number of attempts matches the position of the first success.
            expect(status).toBe("completed");
            expect(attempts.length).toBe(firstSuccessIndex + 1);
            expect(attempts[attempts.length - 1].status).toBe("succeeded");
          } else {
            // All attempts within budget failed: terminal failure recorded
            // after exhausting exactly maxAttempts attempts.
            expect(status).toBe("failed");
            expect(attempts.length).toBe(maxAttempts);
            expect(attempts.every((a) => a.status === "failed")).toBe(true);

            const run = await jobs.runRepo.findById(runId);
            expect(run?.status).toBe("failed");
            expect(run?.completedAt).not.toBeNull();
            expect(run?.error).toBeTruthy();
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("a run that succeeds is never retried further", async () => {
    await fc.assert(
      fc.asyncProperty(maxAttemptsArb, async (maxAttempts) => {
        const jobs = new FakeJobAdapter(maxAttempts);
        jobs.scriptNextRun("wf_1", ["succeed"]);

        const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
        const attempts = await jobs.stepAttemptRepo.findByRunId(runId);

        expect(attempts).toHaveLength(1);
        expect(attempts[0].status).toBe("succeeded");
      }),
      { numRuns: 100 }
    );
  });

  it("a run that always fails records exactly maxAttempts attempts and terminal failure", async () => {
    await fc.assert(
      fc.asyncProperty(maxAttemptsArb, async (maxAttempts) => {
        const jobs = new FakeJobAdapter(maxAttempts);
        const allFailures: StepOutcome[] = Array(maxAttempts).fill("fail");
        jobs.scriptNextRun("wf_1", allFailures);

        const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
        const status = await jobs.getRunStatus(runId);
        const attempts = await jobs.stepAttemptRepo.findByRunId(runId);

        expect(status).toBe("failed");
        expect(attempts).toHaveLength(maxAttempts);
      }),
      { numRuns: 100 }
    );
  });
});
