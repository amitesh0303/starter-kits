/**
 * Deterministic in-memory fake Mux video adapter for testing.
 * Tracks asset creation and status transitions.
 */

import type { VideoStatus } from "@/domain/entities";
import type { AssetStatus, CreateAssetParams, VideoPort } from "./video";

export interface FakeAsset {
  assetId: string;
  playbackId: string | null;
  status: VideoStatus;
  lessonId: string;
  inputUrl: string;
}

export class FakeVideoAdapter implements VideoPort {
  public assets: Map<string, FakeAsset> = new Map();
  private counter = 0;

  async createAsset(params: CreateAssetParams): Promise<AssetStatus> {
    this.counter++;
    const assetId = `asset_${this.counter}_${Date.now()}`;
    const playbackId = `playback_${this.counter}`;

    const asset: FakeAsset = {
      assetId,
      playbackId,
      status: "preparing",
      lessonId: params.lessonId,
      inputUrl: params.inputUrl,
    };

    this.assets.set(assetId, asset);

    return {
      assetId,
      playbackId,
      status: "preparing",
    };
  }

  async getAssetStatus(assetId: string): Promise<AssetStatus> {
    const asset = this.assets.get(assetId);
    if (!asset) {
      return { assetId, playbackId: null, status: "errored" };
    }
    return {
      assetId: asset.assetId,
      playbackId: asset.playbackId,
      status: asset.status,
    };
  }

  getPlaybackUrl(playbackId: string): string {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  /**
   * Simulate a status transition (for testing webhook handlers).
   */
  setAssetStatus(assetId: string, status: VideoStatus): void {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.status = status;
    }
  }

  /**
   * Add a fake asset directly (for testing).
   */
  addAsset(assetId: string, asset: FakeAsset): void {
    this.assets.set(assetId, asset);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.assets.clear();
    this.counter = 0;
  }
}
