/**
 * Mux webhook handler for video processing status updates.
 * Updates lesson video status when Mux finishes processing.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mux sends webhook events with a type field
    const eventType = body.type as string | undefined;

    if (!eventType) {
      return NextResponse.json(
        { error: { code: "INVALID_EVENT", message: "Missing event type" } },
        { status: 400 }
      );
    }

    // Handle video asset ready event
    if (eventType === "video.asset.ready") {
      const assetId = body.data?.id as string | undefined;
      const playbackId = body.data?.playback_ids?.[0]?.id as string | undefined;

      if (assetId && playbackId) {
        // In production, update the lesson record:
        // await db.lesson.updateMany({
        //   where: { videoAssetId: assetId },
        //   data: { videoStatus: "ready", videoPlaybackId: playbackId },
        // });
        void assetId;
        void playbackId;
      }
    }

    // Handle video asset errored event
    if (eventType === "video.asset.errored") {
      const assetId = body.data?.id as string | undefined;
      if (assetId) {
        // In production, update the lesson record:
        // await db.lesson.updateMany({
        //   where: { videoAssetId: assetId },
        //   data: { videoStatus: "errored" },
        // });
        void assetId;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
