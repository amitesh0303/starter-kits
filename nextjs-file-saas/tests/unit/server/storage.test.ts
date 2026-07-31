/**
 * Unit tests for the storage adapter: MIME/size validation enforced before storage.
 */

import { describe, it, expect } from "vitest";
import { FakeObjectStoreAdapter } from "@/lib/server/storage-fake";
import { validateFile } from "@/lib/server/storage";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/domain/policies";
import { FileSizeError, FileTypeError } from "@/lib/server/errors";

describe("validateFile", () => {
  it("accepts a valid file within limits", () => {
    expect(() => validateFile(1024, "image/png")).not.toThrow();
  });

  it("rejects an oversized file", () => {
    expect(() =>
      validateFile(MAX_FILE_SIZE_BYTES + 1, "image/png")
    ).toThrow(FileSizeError);
  });

  it("rejects a disallowed MIME type", () => {
    expect(() => validateFile(1024, "application/x-executable")).toThrow(
      FileTypeError
    );
  });

  it("accepts every MIME type in the allowlist", () => {
    for (const mimeType of ALLOWED_MIME_TYPES) {
      expect(() => validateFile(1024, mimeType)).not.toThrow();
    }
  });
});

describe("FakeObjectStoreAdapter", () => {
  it("stores a valid file", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const result = await adapter.uploadFile({
      key: "uploads/test.png",
      body: Buffer.from("hello"),
      mimeType: "image/png",
      fileName: "test.png",
    });
    expect(result.key).toBe("uploads/test.png");
    expect(adapter.hasFile("uploads/test.png")).toBe(true);
  });

  it("rejects an oversized file before storing it", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const body = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1);

    await expect(
      adapter.uploadFile({
        key: "uploads/big.png",
        body,
        mimeType: "image/png",
        fileName: "big.png",
      })
    ).rejects.toThrow(FileSizeError);

    expect(adapter.hasFile("uploads/big.png")).toBe(false);
    expect(adapter.getFileCount()).toBe(0);
  });

  it("rejects a disallowed MIME type before storing it", async () => {
    const adapter = new FakeObjectStoreAdapter();

    await expect(
      adapter.uploadFile({
        key: "uploads/malware.exe",
        body: Buffer.from("bad"),
        mimeType: "application/x-executable",
        fileName: "malware.exe",
      })
    ).rejects.toThrow(FileTypeError);

    expect(adapter.hasFile("uploads/malware.exe")).toBe(false);
  });

  it("deletes a stored file", async () => {
    const adapter = new FakeObjectStoreAdapter();
    await adapter.uploadFile({
      key: "uploads/test.png",
      body: Buffer.from("hello"),
      mimeType: "image/png",
      fileName: "test.png",
    });
    await adapter.deleteFile("uploads/test.png");
    expect(adapter.hasFile("uploads/test.png")).toBe(false);
    expect(adapter.deletedKeys).toContain("uploads/test.png");
  });

  it("returns a signed URL", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const url = await adapter.getSignedUrl("uploads/test.png");
    expect(url).toContain("uploads/test.png");
    expect(url).toContain("signed=true");
  });
});
