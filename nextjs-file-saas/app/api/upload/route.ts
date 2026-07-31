/**
 * File upload endpoint.
 * Reads a multipart/form-data body, checks storage-quota authorization via
 * domain/policies.canUploadFile, then delegates to the storage adapter -
 * which validates MIME type and byte size BEFORE any object is written to
 * storage. On validation failure, returns 413/415 without touching storage
 * or persisting a FileAsset row.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/server/providers";
import { canUploadFile } from "@/domain/policies";
import {
  FileSizeError,
  FileTypeError,
  AuthenticationError,
  QuotaExceededError,
} from "@/lib/server/errors";
import { InMemoryFileAssetRepository, InMemorySubscriptionRepository } from "@/lib/server/database";

// Shared repositories for the lifetime of this serverless function instance.
// In production these would be swapped for Drizzle-backed repositories.
const fileAssetRepo = new InMemoryFileAssetRepository();
const subscriptionRepo = new InMemorySubscriptionRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new AuthenticationError();
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing file field" } },
        { status: 400 }
      );
    }

    const subscription = await subscriptionRepo.findByUserId(userId);
    const currentUsage = await fileAssetRepo.sumFileSizeByUserId(userId);

    if (!canUploadFile({ userId }, currentUsage, file.size, subscription)) {
      throw new QuotaExceededError();
    }

    const { storage } = getProviders();
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${userId}/${Date.now()}-${file.name}`;

    const uploaded = await storage.uploadFile({
      key,
      body: buffer,
      mimeType: file.type,
      fileName: file.name,
    });

    const fileAsset = await fileAssetRepo.create({
      userId,
      fileName: file.name,
      fileKey: uploaded.key,
      fileSize: file.size,
      mimeType: file.type,
      status: "uploaded",
    });

    return NextResponse.json({ fileAsset }, { status: 201 });
  } catch (error) {
    if (error instanceof FileSizeError || error instanceof FileTypeError) {
      return NextResponse.json(error.toSafeResponse(), {
        status: error.statusCode,
      });
    }
    if (error instanceof AuthenticationError || error instanceof QuotaExceededError) {
      return NextResponse.json(error.toSafeResponse(), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
