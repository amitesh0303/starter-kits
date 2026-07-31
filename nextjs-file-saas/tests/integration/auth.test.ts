/**
 * Integration tests for authentication and authorization flows.
 * Tests Clerk auth context building combined with domain policies.
 */

import { describe, it, expect } from "vitest";
import { buildAuthContext } from "@/lib/server/auth";
import {
  canViewFiles,
  canDownloadOutput,
  canStartConversion,
} from "@/domain/policies";
import type { FileAsset, ConversionJob, Subscription } from "@/domain/entities";

describe("Auth Context Building", () => {
  it("returns null for null userId", () => {
    expect(buildAuthContext(null)).toBeNull();
  });

  it("returns null for empty string userId", () => {
    expect(buildAuthContext("")).toBeNull();
  });

  it("builds context for a valid userId", () => {
    expect(buildAuthContext("user_123")).toEqual({ userId: "user_123" });
  });
});

describe("Auth + Policy Integration", () => {
  const fileAsset: FileAsset = {
    id: "file_1",
    userId: "owner_1",
    fileName: "report.pdf",
    fileKey: "uploads/report.pdf",
    fileSize: 1024,
    mimeType: "application/pdf",
    status: "ready",
    uploadedAt: new Date(),
    createdAt: new Date(),
  };

  const conversionJob: ConversionJob = {
    id: "job_1",
    fileAssetId: "file_1",
    userId: "owner_1",
    outputFormat: "docx",
    status: "completed",
    attempts: 1,
    maxAttempts: 3,
    error: null,
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
  };

  const subscription: Subscription = {
    id: "sub_1",
    userId: "owner_1",
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    stripePriceId: "price_1",
    status: "active",
    currentPeriodEnd: new Date(),
    cancelAtPeriodEnd: false,
    storageQuotaBytes: 10_000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("unauthenticated cannot view files", () => {
    const ctx = buildAuthContext(null);
    expect(canViewFiles(ctx, fileAsset)).toBe(false);
  });

  it("owner can view their files", () => {
    const ctx = buildAuthContext("owner_1");
    expect(canViewFiles(ctx, fileAsset)).toBe(true);
  });

  it("non-owner cannot view files", () => {
    const ctx = buildAuthContext("someone_else");
    expect(canViewFiles(ctx, fileAsset)).toBe(false);
  });

  it("unauthenticated cannot download output", () => {
    const ctx = buildAuthContext(null);
    expect(canDownloadOutput(ctx, conversionJob)).toBe(false);
  });

  it("job owner can download output", () => {
    const ctx = buildAuthContext("owner_1");
    expect(canDownloadOutput(ctx, conversionJob)).toBe(true);
  });

  it("non-owner cannot download output", () => {
    const ctx = buildAuthContext("someone_else");
    expect(canDownloadOutput(ctx, conversionJob)).toBe(false);
  });

  it("owner with active subscription can start a conversion", () => {
    const ctx = buildAuthContext("owner_1");
    expect(canStartConversion(ctx, fileAsset, subscription)).toBe(true);
  });

  it("non-owner cannot start a conversion", () => {
    const ctx = buildAuthContext("someone_else");
    expect(canStartConversion(ctx, fileAsset, subscription)).toBe(false);
  });
});
