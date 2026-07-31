/**
 * Job port: Inngest adapter for file conversion jobs with bounded retry and
 * terminal failure. A conversion job attempts at most `maxAttempts` times.
 * It reaches `completed` exactly once (creating an OutputAsset) if any
 * attempt succeeds, otherwise it reaches the terminal `failed` state after
 * the final attempt is exhausted -- it never remains indefinitely
 * `pending`/`processing`.
 */

import type { JobStatus } from "@/domain/entities";
import type { ConversionJobRepository, OutputAssetRepository } from "./database";
import { NotFoundError, sanitizeProviderError } from "./errors";

// --- Job Port Interface ---

export interface JobPort {
  startConversion(
    fileAssetId: string,
    outputFormat: string,
    userId: string
  ): Promise<{ jobId: string }>;
  getJobStatus(jobId: string): Promise<JobStatus>;
}

export interface InngestClientLike {
  send(event: { name: string; data: Record<string, unknown> }): Promise<unknown>;
}

// --- Shared bounded-retry state machine ---
// Used by both the real Inngest step function and the fake adapter so
// their retry/terminal-failure semantics are provably identical.

export interface BoundedConversionRetryParams {
  jobId: string;
  maxAttempts: number;
  jobRepo: ConversionJobRepository;
  outputAssetRepo: OutputAssetRepository;
  /**
   * Throws on failure; resolves with the output asset descriptor on success.
   */
  execute: (attemptNumber: number) => Promise<{
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
}

/**
 * Executes a conversion job with a bounded number of attempts.
 * - Attempt count never exceeds `maxAttempts`.
 * - Reaches `completed` exactly once if any attempt succeeds, recording an OutputAsset.
 * - Otherwise reaches terminal `failed` after the last attempt, recording the error.
 */
export async function executeConversionWithBoundedRetry(
  params: BoundedConversionRetryParams
): Promise<JobStatus> {
  const { jobId, maxAttempts, jobRepo, outputAssetRepo, execute } = params;

  if (maxAttempts < 1) {
    throw new Error("maxAttempts must be a finite positive integer");
  }

  await jobRepo.updateStatus(jobId, "processing", { startedAt: new Date() });

  for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber++) {
    await jobRepo.updateStatus(jobId, "processing", {
      attempts: attemptNumber,
    });

    try {
      const output = await execute(attemptNumber);
      await outputAssetRepo.create({
        conversionJobId: jobId,
        fileKey: output.fileKey,
        fileName: output.fileName,
        fileSize: output.fileSize,
        mimeType: output.mimeType,
      });
      await jobRepo.updateStatus(jobId, "completed", {
        completedAt: new Date(),
      });
      return "completed";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed";

      if (attemptNumber >= maxAttempts) {
        await jobRepo.updateStatus(jobId, "failed", {
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
  private jobRepo: ConversionJobRepository;
  private outputAssetRepo: OutputAssetRepository;
  private maxAttempts: number;
  private client: InngestClientLike;

  constructor(
    client: InngestClientLike,
    jobRepo: ConversionJobRepository,
    outputAssetRepo: OutputAssetRepository,
    maxAttempts: number = 3
  ) {
    this.client = client;
    this.jobRepo = jobRepo;
    this.outputAssetRepo = outputAssetRepo;
    this.maxAttempts = maxAttempts;
  }

  /**
   * Creates a pending ConversionJob and sends an event to Inngest to
   * execute it. The Inngest function (registered in
   * app/api/inngest/route.ts) is responsible for calling
   * `executeConversionWithBoundedRetry` with the same `maxAttempts`,
   * guaranteeing the job reaches a terminal state.
   */
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

    try {
      await this.client.send({
        name: "file/conversion.requested",
        data: { jobId: job.id, fileAssetId, maxAttempts: this.maxAttempts },
      });
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to start conversion job");
    }

    return { jobId: job.id };
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new NotFoundError("ConversionJob");
    return job.status;
  }
}
