import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

interface Job {
  id: string;
  type: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
}

@Injectable()
export class QueueService {
  private jobs: Map<string, Job> = new Map();

  addJob(type: string, data: Record<string, unknown>): Job {
    const job: Job = {
      id: crypto.randomUUID(),
      type,
      data,
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  listJobs(): Job[] {
    return Array.from(this.jobs.values());
  }
}
