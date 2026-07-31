/**
 * Video port: Mux adapter for video asset management.
 * Handles video upload, processing status tracking, and playback URL generation.
 */

import type { VideoStatus } from "@/domain/entities";
import { VideoError, sanitizeProviderError } from "./errors";

// --- Video Port Interface ---

export interface CreateAssetParams {
  inputUrl: string;
  lessonId: string;
}

export interface AssetStatus {
  assetId: string;
  playbackId: string | null;
  status: VideoStatus;
}

export interface VideoPort {
  createAsset(params: CreateAssetParams): Promise<AssetStatus>;
  getAssetStatus(assetId: string): Promise<AssetStatus>;
  getPlaybackUrl(playbackId: string): string;
}

// --- Mux Status Mapping ---

export function mapMuxStatus(status: string): VideoStatus {
  switch (status) {
    case "ready":
      return "ready";
    case "preparing":
      return "preparing";
    case "errored":
      return "errored";
    default:
      return "waiting";
  }
}

// --- Mux Adapter ---

export class MuxVideoAdapter implements VideoPort {
  private tokenId: string;
  private tokenSecret: string;

  constructor(tokenId: string, tokenSecret: string) {
    this.tokenId = tokenId;
    this.tokenSecret = tokenSecret;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.tokenId}:${this.tokenSecret}`
    ).toString("base64");
    return `Basic ${credentials}`;
  }

  async createAsset(params: CreateAssetParams): Promise<AssetStatus> {
    try {
      const response = await fetch("https://api.mux.com/video/v1/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        body: JSON.stringify({
          input: [{ url: params.inputUrl }],
          playback_policy: ["public"],
          passthrough: params.lessonId,
        }),
      });

      if (!response.ok) {
        throw new VideoError("Failed to create video asset");
      }

      const result = await response.json();
      const asset = result?.data;
      if (!asset) {
        throw new VideoError("No asset data in response");
      }

      return {
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id ?? null,
        status: mapMuxStatus(asset.status ?? "waiting"),
      };
    } catch (error) {
      if (error instanceof VideoError) throw error;
      throw sanitizeProviderError(error, "Failed to create video asset");
    }
  }

  async getAssetStatus(assetId: string): Promise<AssetStatus> {
    try {
      const response = await fetch(
        `https://api.mux.com/video/v1/assets/${assetId}`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthHeader(),
          },
        }
      );

      if (!response.ok) {
        throw new VideoError("Failed to get asset status");
      }

      const result = await response.json();
      const asset = result?.data;
      if (!asset) {
        throw new VideoError("No asset data in response");
      }

      return {
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id ?? null,
        status: mapMuxStatus(asset.status ?? "waiting"),
      };
    } catch (error) {
      if (error instanceof VideoError) throw error;
      throw sanitizeProviderError(error, "Failed to get asset status");
    }
  }

  getPlaybackUrl(playbackId: string): string {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }
}
