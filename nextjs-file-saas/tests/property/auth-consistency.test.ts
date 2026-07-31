/**
 * Feature: multi-stack-boilerplates, Property 4: Authentication and access consistency.
 * For any identity state, resource ownership, and storage quota:
 * - Unauthenticated access is always denied
 * - Unauthorized access (wrong user) is always denied
 * - Upload is granted iff authenticated AND under the subscription's storage quota
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  canUploadFile,
  canStartConversion,
  canViewFiles,
  canDownloadOutput,
} from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type {
  FileAsset,
  ConversionJob,
  Subscription,
  SubscriptionStatus,
} from "@/domain/entities";

const userIdArb = fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 20 });

const subscriptionStatusArb = fc.constantFrom<SubscriptionStatus>(
  "active",
  "past_due",
  "cancelled",
  "trialing"
);

function makeSubscription(
  userId: string,
  status: SubscriptionStatus,
  storageQuotaBytes: number
): Subscription {
  return {
    id: "sub_1",
    userId,
    stripeCustomerId: "cus_1",
    stripeSubscriptionId: "sub_1",
    stripePriceId: "price_1",
    status,
    currentPeriodEnd: new Date(),
    cancelAtPeriodEnd: false,
    storageQuotaBytes,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeFileAsset(userId: string): FileAsset {
  return {
    id: "file_1",
    userId,
    fileName: "test.png",
    fileKey: "uploads/test.png",
    fileSize: 100,
    mimeType: "image/png",
    status: "uploaded",
    uploadedAt: new Date(),
    createdAt: new Date(),
  };
}

function makeConversionJob(userId: string): ConversionJob {
  return {
    id: "job_1",
    fileAssetId: "file_1",
    userId,
    outputFormat: "pdf",
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    error: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
  };
}

describe("Property 4: Authentication and Access Consistency", () => {
  it("unauthenticated always denied for canUploadFile, regardless of quota", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        (currentUsage, fileSize, quota) => {
          const subscription = makeSubscription("owner", "active", quota);
          expect(canUploadFile(null, currentUsage, fileSize, subscription)).toBe(
            false
          );
          expect(
            canUploadFile({ userId: "" }, currentUsage, fileSize, subscription)
          ).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("canUploadFile is granted iff authenticated, has a subscription, AND under quota", () => {
    fc.assert(
      fc.property(
        userIdArb,
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        fc.boolean(),
        (userId, currentUsage, fileSize, quota, hasSubscription) => {
          const ctx: AuthContext = { userId };
          const subscription = hasSubscription
            ? makeSubscription(userId, "active", quota)
            : null;
          const result = canUploadFile(ctx, currentUsage, fileSize, subscription);
          const expected =
            userId.length > 0 &&
            hasSubscription &&
            currentUsage + fileSize <= quota;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("unauthenticated always denied for canViewFiles and canDownloadOutput", () => {
    fc.assert(
      fc.property(userIdArb, (ownerUserId) => {
        fc.pre(ownerUserId.length > 0);
        const fileAsset = makeFileAsset(ownerUserId);
        const job = makeConversionJob(ownerUserId);
        expect(canViewFiles(null, fileAsset)).toBe(false);
        expect(canViewFiles({ userId: "" }, fileAsset)).toBe(false);
        expect(canDownloadOutput(null, job)).toBe(false);
        expect(canDownloadOutput({ userId: "" }, job)).toBe(false);
      }),
      { numRuns: 200 }
    );
  });

  it("only the owner can view files or download outputs", () => {
    fc.assert(
      fc.property(userIdArb, userIdArb, (ownerUserId, callerUserId) => {
        fc.pre(ownerUserId.length > 0);
        const fileAsset = makeFileAsset(ownerUserId);
        const job = makeConversionJob(ownerUserId);
        const ctx: AuthContext = { userId: callerUserId };
        const expected = callerUserId === ownerUserId;
        expect(canViewFiles(ctx, fileAsset)).toBe(expected);
        expect(canDownloadOutput(ctx, job)).toBe(expected);
      }),
      { numRuns: 200 }
    );
  });

  it("canStartConversion requires ownership AND an active/trialing subscription", () => {
    fc.assert(
      fc.property(
        userIdArb,
        userIdArb,
        subscriptionStatusArb,
        (ownerUserId, callerUserId, status) => {
          fc.pre(ownerUserId.length > 0 && callerUserId.length > 0);
          const fileAsset = makeFileAsset(ownerUserId);
          const subscription = makeSubscription(ownerUserId, status, 10_000);
          const ctx: AuthContext = { userId: callerUserId };
          const result = canStartConversion(ctx, fileAsset, subscription);
          const expected =
            callerUserId === ownerUserId &&
            (status === "active" || status === "trialing");
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 300 }
    );
  });
});
