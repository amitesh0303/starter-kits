import { describe, it, expect } from "vitest";
import { createJobsAdapter } from "@/lib/server/jobs";

describe("Jobs Adapter", () => {
  const jobs = createJobsAdapter();

  it("schedules a generation job", async () => {
    const job = await jobs.scheduleGeneration("1");
    expect(job.id).toBeDefined();
    expect(job.status).toBe("completed");
    expect(job.pagesGenerated).toBeGreaterThan(0);
  });

  it("retrieves job status", async () => {
    const job = await jobs.scheduleGeneration("1");
    const status = await jobs.getJobStatus(job.id);
    expect(status).not.toBeNull();
    expect(status!.templateId).toBe("1");
  });

  it("returns null for unknown job", async () => {
    const status = await jobs.getJobStatus("nonexistent");
    expect(status).toBeNull();
  });
});
