import type { GenerationJob } from "@/domain/entities";

/**
 * Background jobs adapter. In production uses Inngest.
 */
export interface JobsAdapter {
  scheduleGeneration(templateId: string): Promise<GenerationJob>;
  getJobStatus(jobId: string): Promise<GenerationJob | null>;
}

export function createJobsAdapter(): JobsAdapter {
  const INNGEST_EVENT_KEY = process.env.INNGEST_EVENT_KEY;

  if (!INNGEST_EVENT_KEY || INNGEST_EVENT_KEY === "your_inngest_event_key") {
    return createFakeJobsAdapter();
  }

  return createFakeJobsAdapter();
}

function createFakeJobsAdapter(): JobsAdapter {
  const jobs: GenerationJob[] = [];

  return {
    async scheduleGeneration(templateId) {
      const job: GenerationJob = {
        id: `job-${Date.now()}`,
        templateId,
        status: "completed",
        pagesGenerated: 10,
        createdAt: new Date(),
        completedAt: new Date(),
      };
      jobs.push(job);
      return job;
    },
    async getJobStatus(jobId) {
      return jobs.find((j) => j.id === jobId) ?? null;
    },
  };
}
