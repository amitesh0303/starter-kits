/**
 * Deterministic in-memory fake job adapter for testing.
 * Simulates the conversion-job lifecycle:
 *   pending -> processing -> completed (with an OutputAsset created)
 *   pending -> processing -> ... -> failed (terminal, after maxAttempts failures)
 * Every attempt is reflected in the job's `attempts` counter, which never
 * exceeds the configured `maxAttempts`.
 */

import type { JobStatus } from "@/domain/entities";
import type { JobPort } from "./jobs";
import {
  InMemoryConversionJobRepository,
  InMemoryOutputAssetRepository,
} from "./database";
import { executeConversionWithBoundedRetry } from "./jobs";

export type StepOutcome = "succeed" | "fail";

export class FakeJobAdapter implements JobPort {
  public jobRepo = new InMemoryConversionJobRepository();
  public outputAssetRepo = new InMemoryOutputAssetRepository();

  private maxAttempts: number;
  private scripts: Map<string, StepOutcome[]> = new Map();
  private nextOutcomesByFileAsset: Map<string, StepOutcome[]> = new Map();

  constructor(maxAttempts: number = 3) {
    this.maxAttempts = maxAttempts;
  }

  /**
   * Script the outcome sequence used the next time a conversion is started
   * for this file asset. If fewer outcomes than `maxAttempts` are provided,
   * remaining attempts fail.
   */
  scriptNextConversion(fileAssetId: string, outcomes: StepOutcome[]): void {
    this.nextOutcomesByFileAsset.set(fileAssetId, outcomes);
  }

  async startConversion(
    fileAssetId: string,
    outputFormat: string,
    userId: string
  ): Promise<{ jobId: string }> {
    const job = await this.jobRepo.create({
      fileAssetId,
      userId,
      outputFormat,
      status: "pending",
      attempts: 0,
      maxAttempts: this.maxAttempts,
      error: null,
      startedAt: null,
      completedAt: null,
    });

    const outcomes = this.nextOutcomesByFileAsset.get(fileAssetId) ?? ["fail"];
    this.scripts.set(job.id, [...outcomes]);

    // Simulate the Inngest step function executing synchronously (deterministic for tests).
    await executeConversionWithBoundedRetry({
      jobId: job.id,
      maxAttempts: this.maxAttempts,
      jobRepo: this.jobRepo,
      outputAssetRepo: this.outputAssetRepo,
      execute: async (attemptNumber) => {
        const script = this.scripts.get(job.id) ?? [];
        const outcome = script[attemptNumber - 1] ?? "fail";
        if (outcome === "fail") {
          throw new Error(`Simulated conversion failure on attempt ${attemptNumber}`);
        }
        return {
          fileKey: `converted/${job.id}.${outputFormat}`,
          fileName: `output.${outputFormat}`,
          fileSize: 1024,
          mimeType: "application/octet-stream",
        };
      },
    });

    return { jobId: job.id };
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new Error("Conversion job not found");
    return job.status;
  }

  /**
   * Reset all in-memory state (for between tests).
   */
  reset(): void {
    this.jobRepo = new InMemoryConversionJobRepository();
    this.outputAssetRepo = new InMemoryOutputAssetRepository();
    this.scripts.clear();
    this.nextOutcomesByFileAsset.clear();
  }
}
