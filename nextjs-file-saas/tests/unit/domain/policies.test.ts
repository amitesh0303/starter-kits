/**
 * Unit tests for domain policies: storage quota, MIME/size allowlist, ownership.
 */

import { describe, it, expect } from "vitest";
import {
  canUploadFile,
  canStartConversion,
  canDownloadOutput,
  canViewFiles,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/domain/policies";
import type { FileAsset, ConversionJob, Subscription } from "@/domain/entities";

const subscription: Subscription = {
  id: "sub_1",
  userId: "user_1",
  stripeCustomerId: "cus_1",
  stripeSubscriptionId: "sub_1",
  stripePriceId: "price_1",
  status: "active",
  currentPeriodEnd: new Date(),
  cancelAtPeriodEnd: false,
  storageQuotaBytes: 1000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fileAsset: FileAsset = {
  id: "file_1",
  userId: "user_1",
  fileName: "test.png",
  fileKey: "uploads/file_1",
  fileSize: 100,
  mimeType: "image/png",
  status: "uploaded",
  uploadedAt: new Date(),
  createdAt: new Date(),
};

const conversionJob: ConversionJob = {
  id: "job_1",
  fileAssetId: "file_1",
  userId: "user_1",
  outputFormat: "pdf",
  status: "pending",
  attempts: 0,
  maxAttempts: 3,
  error: null,
  startedAt: null,
  completedAt: null,
  createdAt: new Date(),
};

describe("canUploadFile", () => {
  it("denies unauthenticated", () => {
    expect(canUploadFile(null, 0, 100, subscription)).toBe(false);
  });

  it("denies empty userId", () => {
    expect(canUploadFile({ userId: "" }, 0, 100, subscription)).toBe(false);
  });

  it("denies when there is no subscription", () => {
    expect(canUploadFile({ userId: "user_1" }, 0, 100, null)).toBe(false);
  });

  it("allows when under quota", () => {
    expect(canUploadFile({ userId: "user_1" }, 500, 100, subscription)).toBe(
      true
    );
  });

  it("allows exactly at quota boundary", () => {
    expect(canUploadFile({ userId: "user_1" }, 900, 100, subscription)).toBe(
      true
    );
  });

  it("denies when over quota", () => {
    expect(canUploadFile({ userId: "user_1" }, 950, 100, subscription)).toBe(
      false
    );
  });
});

describe("canStartConversion", () => {
  it("denies unauthenticated", () => {
    expect(canStartConversion(null, fileAsset, subscription)).toBe(false);
  });

  it("denies a non-owner", () => {
    expect(
      canStartConversion({ userId: "other" }, fileAsset, subscription)
    ).toBe(false);
  });

  it("denies when there is no subscription", () => {
    expect(canStartConversion({ userId: "user_1" }, fileAsset, null)).toBe(
      false
    );
  });

  it("denies when subscription is cancelled", () => {
    const cancelled: Subscription = { ...subscription, status: "cancelled" };
    expect(
      canStartConversion({ userId: "user_1" }, fileAsset, cancelled)
    ).toBe(false);
  });

  it("allows the owner with an active subscription", () => {
    expect(
      canStartConversion({ userId: "user_1" }, fileAsset, subscription)
    ).toBe(true);
  });

  it("allows the owner with a trialing subscription", () => {
    const trialing: Subscription = { ...subscription, status: "trialing" };
    expect(
      canStartConversion({ userId: "user_1" }, fileAsset, trialing)
    ).toBe(true);
  });
});

describe("canDownloadOutput", () => {
  it("denies unauthenticated", () => {
    expect(canDownloadOutput(null, conversionJob)).toBe(false);
  });

  it("allows the job owner", () => {
    expect(canDownloadOutput({ userId: "user_1" }, conversionJob)).toBe(true);
  });

  it("denies a non-owner", () => {
    expect(canDownloadOutput({ userId: "other" }, conversionJob)).toBe(false);
  });
});

describe("canViewFiles", () => {
  it("denies unauthenticated", () => {
    expect(canViewFiles(null, fileAsset)).toBe(false);
  });

  it("allows the owner", () => {
    expect(canViewFiles({ userId: "user_1" }, fileAsset)).toBe(true);
  });

  it("denies a non-owner", () => {
    expect(canViewFiles({ userId: "other" }, fileAsset)).toBe(false);
  });
});

describe("Upload validation constants", () => {
  it("exposes a positive MAX_FILE_SIZE_BYTES", () => {
    expect(MAX_FILE_SIZE_BYTES).toBeGreaterThan(0);
  });

  it("exposes a non-empty ALLOWED_MIME_TYPES allowlist", () => {
    expect(ALLOWED_MIME_TYPES.length).toBeGreaterThan(0);
  });
});
