/**
 * Feature: multi-stack-boilerplates, Property 8: Job retry termination.
 * For any finite positive retry limit and any sequence of retryable outcomes,
 * a conversion job attempts no more than the configured limit, completes
 * exactly once when an attempt succeeds, and otherwise records terminal
 * failure after exhaustion without remaining indefinitely queued or retrying.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";
import type { StepOutcome } from "@/lib/server/jobs-fake";

const outcomeArb = fc.constantFrom<StepOutcome>("succeed", "fail");
const maxAttemptsArb = fc.integer({ min: 1, max: 10 });

describe("Property 8: Job Retry Termination", () => {
  it("attempts never exceed maxAttempts, and the job always reaches a terminal state", async () => {
    await fc.assert(
      fc.asyncProperty(
        maxAttemptsArb,
        fc.array(outcomeArb, { minLength: 1, maxLength: 15 }),
        async (maxAttempts, outcomes) => {
          const jobs = new FakeJobAdapter(maxAttempts);
          jobs.scriptNextConversion("file_1", outcomes);

          const { jobId } = await jobs.startConversion(
            "file_1",
            "pdf",
            "user_1"
          );
          const status = await jobs.getJobStatus(jobId);
          const job = await jobs.jobRepo.findById(jobId);
          const outputs = await jobs.outputAssetRepo.findByConversionJobId(
            jobId
          );

          // Attempt count never exceeds maxAttempts.
          expect(job?.attempts).toBeLessThanOrEqual(maxAttempts);

          // Job always reaches a terminal state, never stuck pending/processing.
          expect(["completed", "failed"]).toContain(status);

          const firstSuccessIndex = outcomes
            .slice(0, maxAttempts)
            .findIndex((o) => o === "succeed");

          if (firstSuccessIndex !== -1) {
            // Completes exactly once: an OutputAsset is recorded, and the
            // number of attempts matches the position of the first success.
            expect(status).toBe("completed");
            expect(job?.attempts).toBe(firstSuccessIndex + 1);
            expect(outputs).toHaveLength(1);
          } else {
            // All attempts within budget failed: terminal failure recorded
            // after exhausting exactly maxAttempts attempts.
            expect(status).toBe("failed");
            expect(job?.attempts).toBe(maxAttempts);
            expect(job?.completedAt).not.toBeNull();
            expect(job?.error).toBeTruthy();
            expect(outputs).toHaveLength(0);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("a job that succeeds is never retried further", async () => {
    await fc.assert(
      fc.asyncProperty(maxAttemptsArb, async (maxAttempts) => {
        const jobs = new FakeJobAdapter(maxAttempts);
        jobs.scriptNextConversion("file_1", ["succeed"]);

        const { jobId } = await jobs.startConversion(
          "file_1",
          "pdf",
          "user_1"
        );
        const job = await jobs.jobRepo.findById(jobId);

        expect(job?.attempts).toBe(1);
        expect(job?.status).toBe("completed");
      }),
      { numRuns: 100 }
    );
  });

  it("a job that always fails records exactly maxAttempts attempts and terminal failure", async () => {
    await fc.assert(
      fc.asyncProperty(maxAttemptsArb, async (maxAttempts) => {
        const jobs = new FakeJobAdapter(maxAttempts);
        const allFailures: StepOutcome[] = Array(maxAttempts).fill("fail");
        jobs.scriptNextConversion("file_1", allFailures);

        const { jobId } = await jobs.startConversion(
          "file_1",
          "pdf",
          "user_1"
        );
        const status = await jobs.getJobStatus(jobId);
        const job = await jobs.jobRepo.findById(jobId);

        expect(status).toBe("failed");
        expect(job?.attempts).toBe(maxAttempts);
      }),
      { numRuns: 100 }
    );
  });
});
