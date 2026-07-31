/**
 * Unit tests for storage adapter - MIME type and file size enforcement.
 */

import { describe, it, expect } from "vitest";
import { FakeObjectStoreAdapter } from "@/lib/server/storage-fake";
import {
  validateFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "@/lib/server/storage";
import { FileSizeError, FileTypeError } from "@/lib/server/errors";

describe("validateFile", () => {
  it("accepts a valid file", () => {
    expect(() => validateFile(1024, "image/png")).not.toThrow();
  });

  it("accepts file at exact max size", () => {
    expect(() => validateFile(MAX_FILE_SIZE, "image/jpeg")).not.toThrow();
  });

  it("rejects file exceeding max size", () => {
    expect(() => validateFile(MAX_FILE_SIZE + 1, "image/png")).toThrow(
      FileSizeError
    );
  });

  it("rejects disallowed MIME type", () => {
    expect(() => validateFile(1024, "application/x-executable")).toThrow(
      FileTypeError
    );
  });

  it("rejects empty MIME type", () => {
    expect(() => validateFile(1024, "")).toThrow(FileTypeError);
  });

  it("accepts all allowed MIME types", () => {
    for (const mime of ALLOWED_MIME_TYPES) {
      expect(() => validateFile(100, mime)).not.toThrow();
    }
  });

  it("uses custom max size when provided", () => {
    expect(() => validateFile(500, "image/png", 400)).toThrow(FileSizeError);
    expect(() => validateFile(400, "image/png", 500)).not.toThrow();
  });

  it("uses custom allowed types when provided", () => {
    expect(() => validateFile(100, "image/png", MAX_FILE_SIZE, ["text/plain"])).toThrow(
      FileTypeError
    );
    expect(() => validateFile(100, "text/plain", MAX_FILE_SIZE, ["text/plain"])).not.toThrow();
  });
});

describe("FakeObjectStoreAdapter", () => {
  it("uploads valid file", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const result = await adapter.uploadFile({
      key: "test/file.png",
      body: Buffer.from("fake image data"),
      mimeType: "image/png",
      fileName: "file.png",
    });

    expect(result.key).toBe("test/file.png");
    expect(result.url).toContain("test/file.png");
    expect(adapter.hasFile("test/file.png")).toBe(true);
    expect(adapter.getFileCount()).toBe(1);
  });

  it("rejects oversized file before storing", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const largeBody = Buffer.alloc(MAX_FILE_SIZE + 1);

    await expect(
      adapter.uploadFile({
        key: "test/large.png",
        body: largeBody,
        mimeType: "image/png",
        fileName: "large.png",
      })
    ).rejects.toThrow(FileSizeError);

    expect(adapter.hasFile("test/large.png")).toBe(false);
  });

  it("rejects invalid MIME type before storing", async () => {
    const adapter = new FakeObjectStoreAdapter();

    await expect(
      adapter.uploadFile({
        key: "test/malware.exe",
        body: Buffer.from("content"),
        mimeType: "application/x-executable",
        fileName: "malware.exe",
      })
    ).rejects.toThrow(FileTypeError);

    expect(adapter.hasFile("test/malware.exe")).toBe(false);
  });

  it("deletes a file", async () => {
    const adapter = new FakeObjectStoreAdapter();
    await adapter.uploadFile({
      key: "test/file.pdf",
      body: Buffer.from("pdf content"),
      mimeType: "application/pdf",
      fileName: "file.pdf",
    });

    expect(adapter.hasFile("test/file.pdf")).toBe(true);
    await adapter.deleteFile("test/file.pdf");
    expect(adapter.hasFile("test/file.pdf")).toBe(false);
    expect(adapter.deletedKeys).toContain("test/file.pdf");
  });

  it("generates signed URL", async () => {
    const adapter = new FakeObjectStoreAdapter();
    const url = await adapter.getSignedUrl("test/file.png", 7200);
    expect(url).toContain("test/file.png");
    expect(url).toContain("signed=true");
    expect(url).toContain("7200");
  });

  it("resets state", async () => {
    const adapter = new FakeObjectStoreAdapter();
    await adapter.uploadFile({
      key: "test/file.png",
      body: Buffer.from("data"),
      mimeType: "image/png",
      fileName: "file.png",
    });
    await adapter.deleteFile("test/file.png");

    adapter.reset();
    expect(adapter.getFileCount()).toBe(0);
    expect(adapter.deletedKeys).toHaveLength(0);
  });
});
