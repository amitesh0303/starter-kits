/**
 * Database repository layer using Drizzle ORM.
 * Provides typed access to file assets, conversion jobs, output assets, and subscriptions.
 * In test/development, use in-memory fakes below.
 */

import type {
  FileAsset,
  ConversionJob,
  OutputAsset,
  Subscription,
  ProcessedEvent,
  FileStatus,
  JobStatus,
} from "@/domain/entities";

// --- Repository Interfaces ---

export interface FileAssetRepository {
  findById(id: string): Promise<FileAsset | null>;
  findByUserId(userId: string): Promise<FileAsset[]>;
  sumFileSizeByUserId(userId: string): Promise<number>;
  create(
    file: Omit<FileAsset, "id" | "createdAt" | "uploadedAt">
  ): Promise<FileAsset>;
  updateStatus(id: string, status: FileStatus): Promise<FileAsset | null>;
  delete(id: string): Promise<void>;
}

export interface ConversionJobRepository {
  findById(id: string): Promise<ConversionJob | null>;
  findByFileAssetId(fileAssetId: string): Promise<ConversionJob[]>;
  create(job: Omit<ConversionJob, "id" | "createdAt">): Promise<ConversionJob>;
  updateStatus(
    id: string,
    status: JobStatus,
    data?: Partial<
      Pick<ConversionJob, "attempts" | "startedAt" | "completedAt" | "error">
    >
  ): Promise<ConversionJob | null>;
}

export interface OutputAssetRepository {
  findByConversionJobId(conversionJobId: string): Promise<OutputAsset[]>;
  create(asset: Omit<OutputAsset, "id" | "createdAt">): Promise<OutputAsset>;
}

export interface SubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription | null>;
  create(
    sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription>;
  updateStatus(
    id: string,
    status: Subscription["status"]
  ): Promise<Subscription | null>;
}

export interface EventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(event: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent>;
}

// --- In-Memory Fake Repositories (for testing) ---

export class InMemoryFileAssetRepository implements FileAssetRepository {
  private files: Map<string, FileAsset> = new Map();

  async findById(id: string): Promise<FileAsset | null> {
    return this.files.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<FileAsset[]> {
    return Array.from(this.files.values()).filter((f) => f.userId === userId);
  }

  async sumFileSizeByUserId(userId: string): Promise<number> {
    return Array.from(this.files.values())
      .filter((f) => f.userId === userId)
      .reduce((sum, f) => sum + f.fileSize, 0);
  }

  async create(
    data: Omit<FileAsset, "id" | "createdAt" | "uploadedAt">
  ): Promise<FileAsset> {
    const now = new Date();
    const file: FileAsset = {
      ...data,
      id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      uploadedAt: now,
      createdAt: now,
    };
    this.files.set(file.id, file);
    return file;
  }

  async updateStatus(
    id: string,
    status: FileStatus
  ): Promise<FileAsset | null> {
    const file = this.files.get(id);
    if (!file) return null;
    const updated = { ...file, status };
    this.files.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.files.delete(id);
  }
}

export class InMemoryConversionJobRepository implements ConversionJobRepository {
  private jobs: Map<string, ConversionJob> = new Map();

  async findById(id: string): Promise<ConversionJob | null> {
    return this.jobs.get(id) ?? null;
  }

  async findByFileAssetId(fileAssetId: string): Promise<ConversionJob[]> {
    return Array.from(this.jobs.values()).filter(
      (j) => j.fileAssetId === fileAssetId
    );
  }

  async create(
    data: Omit<ConversionJob, "id" | "createdAt">
  ): Promise<ConversionJob> {
    const job: ConversionJob = {
      ...data,
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async updateStatus(
    id: string,
    status: JobStatus,
    data?: Partial<
      Pick<ConversionJob, "attempts" | "startedAt" | "completedAt" | "error">
    >
  ): Promise<ConversionJob | null> {
    const job = this.jobs.get(id);
    if (!job) return null;
    const updated = { ...job, ...data, status };
    this.jobs.set(id, updated);
    return updated;
  }
}

export class InMemoryOutputAssetRepository implements OutputAssetRepository {
  private assets: Map<string, OutputAsset> = new Map();

  async findByConversionJobId(conversionJobId: string): Promise<OutputAsset[]> {
    return Array.from(this.assets.values()).filter(
      (a) => a.conversionJobId === conversionJobId
    );
  }

  async create(
    data: Omit<OutputAsset, "id" | "createdAt">
  ): Promise<OutputAsset> {
    const asset: OutputAsset = {
      ...data,
      id: `out_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    this.assets.set(asset.id, asset);
    return asset;
  }
}

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  async findByUserId(userId: string): Promise<Subscription | null> {
    for (const s of this.subscriptions.values()) {
      if (s.userId === userId) return s;
    }
    return null;
  }

  async create(
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription> {
    const sub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  async updateStatus(
    id: string,
    status: Subscription["status"]
  ): Promise<Subscription | null> {
    const s = this.subscriptions.get(id);
    if (!s) return null;
    const updated = { ...s, status, updatedAt: new Date() };
    this.subscriptions.set(id, updated);
    return updated;
  }
}

export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, ProcessedEvent> = new Map();

  async exists(providerEventId: string): Promise<boolean> {
    for (const e of this.events.values()) {
      if (e.providerEventId === providerEventId) return true;
    }
    return false;
  }

  async create(
    data: Omit<ProcessedEvent, "id" | "processedAt">
  ): Promise<ProcessedEvent> {
    const event: ProcessedEvent = {
      ...data,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      processedAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }
}
