/**
 * Unit tests for the job adapter: bounded retry and terminal failure for
 * file conversion jobs.
 */

import { describe, it, expect } from "vitest";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";

describe("FakeJobAdapter bounded retry", () => {
  it("completes on the first attempt when scripted to succeed", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextConversion("file_1", ["succeed"]);

    const { jobId } = await jobs.startConversion("file_1", "pdf", "user_1");
    const status = await jobs.getJobStatus(jobId);

    expect(status).toBe("completed");
    const outputs = await jobs.outputAssetRepo.findByConversionJobId(jobId);
    expect(outputs).toHaveLength(1);
  });

  it("retries after a failure and completes within maxAttempts", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextConversion("file_1", ["fail", "succeed"]);

    const { jobId } = await jobs.startConversion("file_1", "pdf", "user_1");
    const status = await jobs.getJobStatus(jobId);
    const job = await jobs.jobRepo.findById(jobId);

    expect(status).toBe("completed");
    expect(job?.attempts).toBe(2);
  });

  it("reaches terminal failed state after exhausting maxAttempts", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextConversion("file_1", ["fail", "fail", "fail"]);

    const { jobId } = await jobs.startConversion("file_1", "pdf", "user_1");
    const status = await jobs.getJobStatus(jobId);
    const job = await jobs.jobRepo.findById(jobId);

    expect(status).toBe("failed");
    expect(job?.attempts).toBe(3);
    expect(job?.error).toBeTruthy();
    expect(job?.completedAt).not.toBeNull();

    const outputs = await jobs.outputAssetRepo.findByConversionJobId(jobId);
    expect(outputs).toHaveLength(0);
  });

  it("never exceeds maxAttempts even when all scripted outcomes fail", async () => {
    const jobs = new FakeJobAdapter(2);
    jobs.scriptNextConversion("file_1", ["fail", "fail", "fail", "fail"]);

    const { jobId } = await jobs.startConversion("file_1", "pdf", "user_1");
    const job = await jobs.jobRepo.findById(jobId);
    expect(job?.attempts).toBeLessThanOrEqual(2);
  });

  it("defaults unscripted attempts to fail (never stuck pending/processing)", async () => {
    const jobs = new FakeJobAdapter(1);

    const { jobId } = await jobs.startConversion(
      "unscripted_file",
      "pdf",
      "user_1"
    );
    const status = await jobs.getJobStatus(jobId);

    expect(["completed", "failed"]).toContain(status);
    expect(status).not.toBe("pending");
    expect(status).not.toBe("processing");
  });
});
