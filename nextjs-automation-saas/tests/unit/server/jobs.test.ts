/**
 * Unit tests for the job adapter: bounded retry and terminal failure.
 */

import { describe, it, expect } from "vitest";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";

describe("FakeJobAdapter bounded retry", () => {
  it("succeeds on the first attempt when scripted to succeed", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextRun("wf_1", ["succeed"]);

    const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
    const status = await jobs.getRunStatus(runId);

    expect(status).toBe("completed");
    const attempts = await jobs.stepAttemptRepo.findByRunId(runId);
    expect(attempts).toHaveLength(1);
    expect(attempts[0].status).toBe("succeeded");
  });

  it("retries after a failure and succeeds within maxAttempts", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextRun("wf_1", ["fail", "succeed"]);

    const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
    const status = await jobs.getRunStatus(runId);

    expect(status).toBe("completed");
    const attempts = await jobs.stepAttemptRepo.findByRunId(runId);
    expect(attempts).toHaveLength(2);
    expect(attempts[0].status).toBe("failed");
    expect(attempts[1].status).toBe("succeeded");
  });

  it("reaches terminal failed state after exhausting maxAttempts", async () => {
    const jobs = new FakeJobAdapter(3);
    jobs.scriptNextRun("wf_1", ["fail", "fail", "fail"]);

    const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
    const status = await jobs.getRunStatus(runId);

    expect(status).toBe("failed");
    const attempts = await jobs.stepAttemptRepo.findByRunId(runId);
    expect(attempts).toHaveLength(3);
    expect(attempts.every((a) => a.status === "failed")).toBe(true);

    const run = await jobs.runRepo.findById(runId);
    expect(run?.status).toBe("failed");
    expect(run?.error).toBeTruthy();
    expect(run?.completedAt).not.toBeNull();
  });

  it("never exceeds maxAttempts even when all scripted outcomes fail", async () => {
    const jobs = new FakeJobAdapter(2);
    jobs.scriptNextRun("wf_1", ["fail", "fail", "fail", "fail"]);

    const { runId } = await jobs.triggerWorkflow("wf_1", "user_1");
    const attempts = await jobs.stepAttemptRepo.findByRunId(runId);
    expect(attempts.length).toBeLessThanOrEqual(2);
  });

  it("defaults unscripted attempts to fail (never stuck pending/running)", async () => {
    const jobs = new FakeJobAdapter(1);
    // no script provided for this workflow

    const { runId } = await jobs.triggerWorkflow("wf_unscripted", "user_1");
    const status = await jobs.getRunStatus(runId);

    expect(["completed", "failed"]).toContain(status);
    expect(status).not.toBe("pending");
    expect(status).not.toBe("running");
  });
});
