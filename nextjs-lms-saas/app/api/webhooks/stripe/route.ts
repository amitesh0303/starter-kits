/**
 * Stripe webhook handler for subscription lifecycle events.
 * Verifies the webhook signature before any state mutation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getProviders } from "@/lib/server/providers";
import { WebhookVerificationError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: { code: "WEBHOOK_INVALID", message: "Missing signature" } },
        { status: 400 }
      );
    }

    const { billing } = getProviders();
    const event = billing.verifyWebhook(rawBody, signature);
    await billing.handleWebhookEvent(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(error.toSafeResponse(), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
