/**
 * Unit tests for video adapter (Mux fake).
 */

import { describe, it, expect } from "vitest";
import { FakeVideoAdapter } from "@/lib/server/video-fake";
import { mapMuxStatus } from "@/lib/server/video";

describe("FakeVideoAdapter", () => {
  describe("createAsset", () => {
    it("creates an asset with preparing status", async () => {
      const video = new FakeVideoAdapter();
      const result = await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      expect(result.assetId).toBeTruthy();
      expect(result.playbackId).toBeTruthy();
      expect(result.status).toBe("preparing");
    });

    it("stores the asset in the map", async () => {
      const video = new FakeVideoAdapter();
      const result = await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      const asset = video.assets.get(result.assetId);
      expect(asset).toBeDefined();
      expect(asset!.lessonId).toBe("lesson_1");
      expect(asset!.inputUrl).toBe("https://example.com/video.mp4");
    });
  });

  describe("getAssetStatus", () => {
    it("returns the current status of an existing asset", async () => {
      const video = new FakeVideoAdapter();
      const created = await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      const status = await video.getAssetStatus(created.assetId);
      expect(status.status).toBe("preparing");
      expect(status.assetId).toBe(created.assetId);
    });

    it("returns errored for unknown asset", async () => {
      const video = new FakeVideoAdapter();
      const status = await video.getAssetStatus("nonexistent");
      expect(status.status).toBe("errored");
    });
  });

  describe("getPlaybackUrl", () => {
    it("returns a valid Mux stream URL", () => {
      const video = new FakeVideoAdapter();
      const url = video.getPlaybackUrl("playback_123");
      expect(url).toBe("https://stream.mux.com/playback_123.m3u8");
    });
  });

  describe("setAssetStatus", () => {
    it("transitions asset to ready", async () => {
      const video = new FakeVideoAdapter();
      const created = await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      video.setAssetStatus(created.assetId, "ready");
      const status = await video.getAssetStatus(created.assetId);
      expect(status.status).toBe("ready");
    });

    it("transitions asset to errored", async () => {
      const video = new FakeVideoAdapter();
      const created = await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      video.setAssetStatus(created.assetId, "errored");
      const status = await video.getAssetStatus(created.assetId);
      expect(status.status).toBe("errored");
    });
  });

  describe("reset", () => {
    it("clears all assets", async () => {
      const video = new FakeVideoAdapter();
      await video.createAsset({
        inputUrl: "https://example.com/video.mp4",
        lessonId: "lesson_1",
      });

      video.reset();
      expect(video.assets.size).toBe(0);
    });
  });
});

describe("mapMuxStatus", () => {
  it("maps ready", () => {
    expect(mapMuxStatus("ready")).toBe("ready");
  });

  it("maps preparing", () => {
    expect(mapMuxStatus("preparing")).toBe("preparing");
  });

  it("maps errored", () => {
    expect(mapMuxStatus("errored")).toBe("errored");
  });

  it("maps unknown to waiting", () => {
    expect(mapMuxStatus("unknown")).toBe("waiting");
  });
});
