/**
 * Lemon Squeezy webhook endpoint.
 * Verifies webhook signature using raw body + signature header.
 * Processes events idempotently.
 */

import { NextResponse } from "next/server";
import { getProviders } from "@/lib/server/providers";
import { WebhookVerificationError } from "@/lib/server/errors";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") ?? "";

    const providers = getProviders();
    const event = providers.billing.verifyWebhook(rawBody, signature);

    await providers.billing.handleWebhookEvent(event);

    return NextResponse.json({ received: true });
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
