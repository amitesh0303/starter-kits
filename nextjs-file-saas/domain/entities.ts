/**
 * Domain entity types for the File SaaS application.
 * Core business objects: file assets, conversion jobs, output assets,
 * subscriptions, and processed events.
 */

export type FileStatus = "uploaded" | "processing" | "ready" | "failed";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface FileAsset {
  id: string;
  userId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  status: FileStatus;
  uploadedAt: Date;
  createdAt: Date;
}

export interface ConversionJob {
  id: string;
  fileAssetId: string;
  userId: string;
  outputFormat: string;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface OutputAsset {
  id: string;
  conversionJobId: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  storageQuotaBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessedEvent {
  id: string;
  providerEventId: string;
  eventType: string;
  processedAt: Date;
}
