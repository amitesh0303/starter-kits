/**
 * Property 3 equivalent: File upload limits enforcement.
 * Random file sizes and MIME types are always validated BEFORE storage.
 * Uses fast-check to generate random scenarios.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeObjectStoreAdapter } from "@/lib/server/storage-fake";
import {
  validateFile,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from "@/lib/server/storage";
import { FileSizeError, FileTypeError } from "@/lib/server/errors";

describe("Property: File limits always enforced before storage", () => {
  it("oversized files are always rejected regardless of MIME type", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE * 10 }),
        fc.constantFrom(...ALLOWED_MIME_TYPES),
        (fileSize, mimeType) => {
          expect(() => validateFile(fileSize, mimeType)).toThrow(FileSizeError);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("disallowed MIME types are always rejected regardless of file size", () => {
    const disallowedMimes = [
      "application/x-executable",
      "application/x-msdownload",
      "text/html",
      "application/javascript",
      "application/x-sh",
      "video/mp4",
      "audio/mpeg",
    ];

    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        fc.constantFrom(...disallowedMimes),
        (fileSize, mimeType) => {
          expect(() => validateFile(fileSize, mimeType)).toThrow(FileTypeError);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("valid files within limits are always accepted", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        fc.constantFrom(...ALLOWED_MIME_TYPES),
        (fileSize, mimeType) => {
          expect(() => validateFile(fileSize, mimeType)).not.toThrow();
        }
      ),
      { numRuns: 200 }
    );
  });

  it("FakeObjectStoreAdapter never stores oversized files", () => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: MAX_FILE_SIZE + 1, max: MAX_FILE_SIZE + 1000 }),
        fc.constantFrom(...ALLOWED_MIME_TYPES),
        fc.uuid(),
        async (fileSize, mimeType, key) => {
          const adapter = new FakeObjectStoreAdapter();
          const body = Buffer.alloc(fileSize);

          await expect(
            adapter.uploadFile({ key, body, mimeType, fileName: "test.bin" })
          ).rejects.toThrow(FileSizeError);

          expect(adapter.hasFile(key)).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("FakeObjectStoreAdapter never stores disallowed MIME types", () => {
    const disallowedMimes = [
      "application/x-executable",
      "text/html",
      "application/javascript",
    ];

    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1000 }),
        fc.constantFrom(...disallowedMimes),
        fc.uuid(),
        async (fileSize, mimeType, key) => {
          const adapter = new FakeObjectStoreAdapter();
          const body = Buffer.alloc(fileSize);

          await expect(
            adapter.uploadFile({ key, body, mimeType, fileName: "test.bin" })
          ).rejects.toThrow(FileTypeError);

          expect(adapter.hasFile(key)).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it("random arbitrary MIME strings are rejected unless in allow list", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: MAX_FILE_SIZE }),
        fc.string({ minLength: 3, maxLength: 50 }),
        (fileSize, randomMime) => {
          if (ALLOWED_MIME_TYPES.includes(randomMime)) {
            expect(() => validateFile(fileSize, randomMime)).not.toThrow();
          } else {
            expect(() => validateFile(fileSize, randomMime)).toThrow(FileTypeError);
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
