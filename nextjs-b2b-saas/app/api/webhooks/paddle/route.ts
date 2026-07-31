/**
 * Paddle webhook endpoint.
 * Verifies webhook signature against raw body before any state mutation.
 * Processes events idempotently using processed_events table.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getProviders } from "@/lib/server/providers";
import { WebhookVerificationError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature") ?? "";

    const { billing } = getProviders();

    // Verify webhook signature - throws if invalid
    const event = billing.verifyWebhook(rawBody, signature);

    // Process event (idempotent)
    await billing.handleWebhookEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: { code: "WEBHOOK_INVALID", message: "Invalid signature" } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Webhook processing failed" } },
      { status: 500 }
    );
  }
}
