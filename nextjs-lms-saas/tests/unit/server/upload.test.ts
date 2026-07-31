/**
 * Unit tests for upload adapter (UploadThing validation).
 */

import { describe, it, expect } from "vitest";
import { FakeUploadAdapter } from "@/lib/server/upload-fake";
import { UploadError } from "@/lib/server/errors";

describe("FakeUploadAdapter", () => {
  describe("validateUpload", () => {
    it("accepts valid video/mp4", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "video.mp4",
          fileSize: 1024 * 1024,
          mimeType: "video/mp4",
        })
      ).not.toThrow();
    });

    it("accepts valid video/webm", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "video.webm",
          fileSize: 1024 * 1024,
          mimeType: "video/webm",
        })
      ).not.toThrow();
    });

    it("accepts valid video/quicktime", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "video.mov",
          fileSize: 1024 * 1024,
          mimeType: "video/quicktime",
        })
      ).not.toThrow();
    });

    it("rejects invalid MIME type", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "photo.png",
          fileSize: 1024 * 1024,
          mimeType: "image/png",
        })
      ).toThrow(UploadError);
    });

    it("rejects oversized file", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "big.mp4",
          fileSize: 600 * 1024 * 1024, // 600MB, over 512MB limit
          mimeType: "video/mp4",
        })
      ).toThrow(UploadError);
    });

    it("rejects empty file name", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "",
          fileSize: 1024,
          mimeType: "video/mp4",
        })
      ).toThrow(UploadError);
    });

    it("rejects whitespace-only file name", () => {
      const upload = new FakeUploadAdapter();
      expect(() =>
        upload.validateUpload({
          fileName: "   ",
          fileSize: 1024,
          mimeType: "video/mp4",
        })
      ).toThrow(UploadError);
    });
  });

  describe("getUploadUrl", () => {
    it("returns upload URL and file key for valid upload", async () => {
      const upload = new FakeUploadAdapter();
      const result = await upload.getUploadUrl({
        fileName: "lecture.mp4",
        fileSize: 1024 * 1024,
        mimeType: "video/mp4",
      });

      expect(result.uploadUrl).toContain("https://fake-upload.test/");
      expect(result.fileKey).toContain("lecture.mp4");
    });

    it("tracks uploads", async () => {
      const upload = new FakeUploadAdapter();
      await upload.getUploadUrl({
        fileName: "video1.mp4",
        fileSize: 1024,
        mimeType: "video/mp4",
      });
      await upload.getUploadUrl({
        fileName: "video2.mp4",
        fileSize: 2048,
        mimeType: "video/mp4",
      });

      expect(upload.getUploads()).toHaveLength(2);
    });

    it("rejects invalid upload in getUploadUrl", async () => {
      const upload = new FakeUploadAdapter();
      await expect(
        upload.getUploadUrl({
          fileName: "doc.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
        })
      ).rejects.toThrow(UploadError);
    });
  });

  describe("reset", () => {
    it("clears all uploads", async () => {
      const upload = new FakeUploadAdapter();
      await upload.getUploadUrl({
        fileName: "video.mp4",
        fileSize: 1024,
        mimeType: "video/mp4",
      });

      upload.reset();
      expect(upload.getUploads()).toHaveLength(0);
    });
  });
});
