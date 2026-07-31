/**
 * Deny-by-default authorization policies for the File SaaS.
 * All access checks return false unless an explicit allow condition is met.
 * Includes upload validation constants (MIME allowlist and byte limit) and
 * storage-quota gating.
 */

import type { FileAsset, ConversionJob, Subscription } from "./entities";

export interface AuthContext {
  userId: string;
}

// --- Upload validation constants ---

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/tiff",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/wav",
];

/**
 * Check if the user can upload a file: authenticated and the file fits
 * within the subscription's remaining storage quota.
 */
export function canUploadFile(
  ctx: AuthContext | null,
  currentUsageBytes: number,
  fileSize: number,
  subscription: Subscription | null
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  if (!subscription) return false;
  return currentUsageBytes + fileSize <= subscription.storageQuotaBytes;
}

/**
 * Check if the user can start a conversion job for a file asset.
 * Requires file ownership and an active/trialing subscription.
 */
export function canStartConversion(
  ctx: AuthContext | null,
  fileAsset: FileAsset,
  subscription: Subscription | null
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  if (ctx.userId !== fileAsset.userId) return false;
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "trialing";
}

/**
 * Check if the user can download a conversion job's output (job owner only).
 */
export function canDownloadOutput(
  ctx: AuthContext | null,
  conversionJob: ConversionJob
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === conversionJob.userId;
}

/**
 * Check if the user can view a file asset (owner only).
 */
export function canViewFiles(
  ctx: AuthContext | null,
  fileAsset: FileAsset
): boolean {
  if (!ctx) return false;
  if (!ctx.userId) return false;
  return ctx.userId === fileAsset.userId;
}
