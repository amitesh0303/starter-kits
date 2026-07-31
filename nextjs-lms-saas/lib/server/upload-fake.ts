/**
 * Deterministic in-memory fake UploadThing adapter for testing.
 * Tracks uploaded files and validates MIME/size constraints.
 */

import type { UploadPort, ValidateUploadParams, UploadUrlResult } from "./upload";
import { ALLOWED_VIDEO_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./upload";
import { UploadError } from "./errors";

export interface FakeUploadedFile {
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export class FakeUploadAdapter implements UploadPort {
  public uploads: Map<string, FakeUploadedFile> = new Map();
  private counter = 0;

  validateUpload(params: ValidateUploadParams): void {
    if (!ALLOWED_VIDEO_MIME_TYPES.includes(params.mimeType)) {
      throw new UploadError(
        `File type "${params.mimeType}" not allowed. Allowed: ${ALLOWED_VIDEO_MIME_TYPES.join(", ")}`
      );
    }
    if (params.fileSize > MAX_FILE_SIZE_BYTES) {
      throw new UploadError(
        `File size ${params.fileSize} exceeds maximum of ${MAX_FILE_SIZE_BYTES} bytes`
      );
    }
    if (!params.fileName || params.fileName.trim().length === 0) {
      throw new UploadError("File name is required");
    }
  }

  async getUploadUrl(params: ValidateUploadParams): Promise<UploadUrlResult> {
    this.validateUpload(params);

    this.counter++;
    const fileKey = `fake_${this.counter}_${params.fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const uploadUrl = `https://fake-upload.test/${fileKey}`;

    this.uploads.set(fileKey, {
      fileKey,
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      uploadedAt: new Date(),
    });

    return { uploadUrl, fileKey };
  }

  /**
   * Get all uploaded files.
   */
  getUploads(): FakeUploadedFile[] {
    return Array.from(this.uploads.values());
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.uploads.clear();
    this.counter = 0;
  }
}
