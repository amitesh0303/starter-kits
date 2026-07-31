/**
 * Object store port: Cloudflare R2 (S3-compatible) adapter for file attachments.
 * MIME type and file size validation are enforced BEFORE any upload to storage.
 */

import { FileSizeError, FileTypeError, StorageError, sanitizeProviderError } from "./errors";

// --- File validation constants ---

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
];

// --- Object Store Port Interface ---

export interface UploadFileParams {
  key: string;
  body: Buffer;
  mimeType: string;
  fileName: string;
}

export interface ObjectStorePort {
  uploadFile(params: UploadFileParams): Promise<{ key: string; url: string }>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

// --- File Validation (enforced before storage) ---

/**
 * Validates file size and MIME type BEFORE upload.
 * Throws FileSizeError or FileTypeError if validation fails.
 */
export function validateFile(
  fileSize: number,
  mimeType: string,
  maxSize: number = MAX_FILE_SIZE,
  allowedTypes: string[] = ALLOWED_MIME_TYPES
): void {
  if (fileSize > maxSize) {
    throw new FileSizeError(maxSize);
  }
  if (!allowedTypes.includes(mimeType)) {
    throw new FileTypeError(mimeType, allowedTypes);
  }
}

// --- R2 Adapter ---

export class R2ObjectStoreAdapter implements ObjectStorePort {
  private bucketName: string;
  private publicUrl: string;
  private client: {
    send: (command: unknown) => Promise<unknown>;
  };

  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
  }) {
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;

    // Dynamic import pattern for @aws-sdk/client-s3
    // The actual S3Client is created lazily to avoid issues in test environments
    const { S3Client } = require("@aws-sdk/client-s3");
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(params: UploadFileParams): Promise<{ key: string; url: string }> {
    // Validate BEFORE uploading
    validateFile(params.body.length, params.mimeType);

    try {
      const { PutObjectCommand } = require("@aws-sdk/client-s3");
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.mimeType,
        Metadata: {
          "original-filename": params.fileName,
        },
      });

      await this.client.send(command);

      return {
        key: params.key,
        url: `${this.publicUrl}/${params.key}`,
      };
    } catch (error) {
      if (error instanceof FileSizeError || error instanceof FileTypeError) {
        throw error;
      }
      throw sanitizeProviderError(error, "Failed to upload file to storage");
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to delete file from storage");
    }
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const { GetObjectCommand } = require("@aws-sdk/client-s3");
      const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const url = await getSignedUrl(this.client, command, {
        expiresIn: expiresInSeconds,
      });
      return url;
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to generate signed URL");
    }
  }
}
