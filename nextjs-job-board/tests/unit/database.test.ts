import { describe, it, expect } from "vitest";
import { createDatabaseAdapter } from "@/lib/server/database";

describe("Database Adapter", () => {
  const db = createDatabaseAdapter();

  it("returns jobs with pagination", async () => {
    const result = await db.getJobs(1, 10);
    expect(result.jobs).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns job by id", async () => {
    const job = await db.getJobById("1");
    expect(job).not.toBeNull();
    expect(job!.title).toBe("Senior Frontend Developer");
  });

  it("returns null for unknown id", async () => {
    const job = await db.getJobById("nonexistent");
    expect(job).toBeNull();
  });

  it("returns categories", async () => {
    const categories = await db.getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  it("returns jobs by category", async () => {
    const result = await db.getJobsByCategory("engineering", 1, 10);
    expect(result.jobs.length).toBeGreaterThan(0);
    expect(result.jobs[0].category).toBe("engineering");
  });
});
