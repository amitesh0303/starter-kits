/**
 * Integration test: upload -> conversion -> output-asset-created flow,
 * including a rejected-upload case that never reaches storage.
 */

import { describe, it, expect } from "vitest";
import { FakeObjectStoreAdapter } from "@/lib/server/storage-fake";
import { FakeJobAdapter } from "@/lib/server/jobs-fake";
import {
  InMemoryFileAssetRepository,
  InMemorySubscriptionRepository,
} from "@/lib/server/database";
import { canUploadFile, canStartConversion } from "@/domain/policies";
import { FileSizeError, FileTypeError } from "@/lib/server/errors";
import type { Subscription } from "@/domain/entities";

describe("Upload -> Conversion -> Output flow", () => {
  it("uploads a valid file, starts a conversion, and produces an output asset", async () => {
    const storage = new FakeObjectStoreAdapter();
    const jobs = new FakeJobAdapter(3);
    const fileAssetRepo = new InMemoryFileAssetRepository();
    const subscriptionRepo = new InMemorySubscriptionRepository();

    const userId = "user_1";
    const subscription: Subscription = await subscriptionRepo.create({
      userId,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      stripePriceId: "price_1",
      status: "active",
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      storageQuotaBytes: 10_000,
    });

    const currentUsage = await fileAssetRepo.sumFileSizeByUserId(userId);
    expect(canUploadFile({ userId }, currentUsage, 1024, subscription)).toBe(
      true
    );

    const uploaded = await storage.uploadFile({
      key: "uploads/report.pdf",
      body: Buffer.alloc(1024),
      mimeType: "application/pdf",
      fileName: "report.pdf",
    });

    const fileAsset = await fileAssetRepo.create({
      userId,
      fileName: "report.pdf",
      fileKey: uploaded.key,
      fileSize: 1024,
      mimeType: "application/pdf",
      status: "uploaded",
    });

    expect(canStartConversion({ userId }, fileAsset, subscription)).toBe(true);

    jobs.scriptNextConversion(fileAsset.id, ["succeed"]);
    const { jobId } = await jobs.startConversion(
      fileAsset.id,
      "docx",
      userId
    );
    const status = await jobs.getJobStatus(jobId);
    expect(status).toBe("completed");

    const outputs = await jobs.outputAssetRepo.findByConversionJobId(jobId);
    expect(outputs).toHaveLength(1);
  });

  it("rejects an oversized upload before it ever reaches storage", async () => {
    const storage = new FakeObjectStoreAdapter();
    const oversized = Buffer.alloc(200 * 1024 * 1024); // 200 MB > 100 MB limit

    await expect(
      storage.uploadFile({
        key: "uploads/huge.mp4",
        body: oversized,
        mimeType: "video/mp4",
        fileName: "huge.mp4",
      })
    ).rejects.toThrow(FileSizeError);

    expect(storage.getFileCount()).toBe(0);
  });

  it("rejects a disallowed MIME type before it ever reaches storage", async () => {
    const storage = new FakeObjectStoreAdapter();

    await expect(
      storage.uploadFile({
        key: "uploads/script.exe",
        body: Buffer.from("bad"),
        mimeType: "application/x-executable",
        fileName: "script.exe",
      })
    ).rejects.toThrow(FileTypeError);

    expect(storage.getFileCount()).toBe(0);
  });

  it("denies upload when it would exceed the subscription's storage quota", async () => {
    const fileAssetRepo = new InMemoryFileAssetRepository();
    const userId = "user_1";

    const subscription: Subscription = {
      id: "sub_1",
      userId,
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

    await fileAssetRepo.create({
      userId,
      fileName: "existing.png",
      fileKey: "uploads/existing.png",
      fileSize: 900,
      mimeType: "image/png",
      status: "ready",
    });

    const currentUsage = await fileAssetRepo.sumFileSizeByUserId(userId);
    expect(
      canUploadFile({ userId }, currentUsage, 200, subscription)
    ).toBe(false);
  });

  it("conversion job reaches terminal failed state after retries are exhausted", async () => {
    const jobs = new FakeJobAdapter(2);
    jobs.scriptNextConversion("file_x", ["fail", "fail"]);

    const { jobId } = await jobs.startConversion("file_x", "png", "user_1");
    const status = await jobs.getJobStatus(jobId);

    expect(status).toBe("failed");
    const outputs = await jobs.outputAssetRepo.findByConversionJobId(jobId);
    expect(outputs).toHaveLength(0);
  });
});
