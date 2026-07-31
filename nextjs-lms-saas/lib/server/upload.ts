/**
 * Upload port: UploadThing adapter for file upload management.
 * Handles MIME type and size validation before generating upload URLs.
 */

import { UploadError, sanitizeProviderError } from "./errors";

// --- Upload Port Interface ---

export interface ValidateUploadParams {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadUrlResult {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadPort {
  validateUpload(params: ValidateUploadParams): void;
  getUploadUrl(params: ValidateUploadParams): Promise<UploadUrlResult>;
}

// --- Constants ---

const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

const MAX_FILE_SIZE_BYTES = 512 * 1024 * 1024; // 512MB

// --- UploadThing Adapter ---

export class UploadThingAdapter implements UploadPort {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

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

    try {
      // In production, this would call UploadThing's API to get a presigned URL
      const fileKey = `ut_${Date.now()}_${params.fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const uploadUrl = `https://uploadthing.com/api/upload/${fileKey}`;

      void this.token; // Used in real implementation

      return { uploadUrl, fileKey };
    } catch (error) {
      if (error instanceof UploadError) throw error;
      throw sanitizeProviderError(error, "Failed to generate upload URL");
    }
  }
}

export { ALLOWED_VIDEO_MIME_TYPES, MAX_FILE_SIZE_BYTES };
