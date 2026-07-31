/**
 * Deterministic in-memory fake object store adapter for testing.
 * Enforces the same MIME type and file size limits as the real adapter.
 * Records all uploads/deletes for assertion in tests.
 */

import type { ObjectStorePort, UploadFileParams } from "./storage";
import { validateFile } from "./storage";

export interface StoredFile {
  key: string;
  body: Buffer;
  mimeType: string;
  fileName: string;
  uploadedAt: Date;
}

export class FakeObjectStoreAdapter implements ObjectStorePort {
  public files: Map<string, StoredFile> = new Map();
  public deletedKeys: string[] = [];

  async uploadFile(params: UploadFileParams): Promise<{ key: string; url: string }> {
    // Enforce same validation as real adapter BEFORE storage
    validateFile(params.body.length, params.mimeType);

    const storedFile: StoredFile = {
      key: params.key,
      body: params.body,
      mimeType: params.mimeType,
      fileName: params.fileName,
      uploadedAt: new Date(),
    };

    this.files.set(params.key, storedFile);

    return {
      key: params.key,
      url: `https://fake-r2.example.com/${params.key}`,
    };
  }

  async deleteFile(key: string): Promise<void> {
    this.files.delete(key);
    this.deletedKeys.push(key);
  }

  async getSignedUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    return `https://fake-r2.example.com/${key}?signed=true&expires=${_expiresInSeconds ?? 3600}`;
  }

  /**
   * Check if a file exists in the store.
   */
  hasFile(key: string): boolean {
    return this.files.has(key);
  }

  /**
   * Get a stored file for assertions.
   */
  getFile(key: string): StoredFile | undefined {
    return this.files.get(key);
  }

  /**
   * Get the count of stored files.
   */
  getFileCount(): number {
    return this.files.size;
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.files.clear();
    this.deletedKeys = [];
  }
}
