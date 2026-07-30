/**
 * Stripe webhook endpoint.
 * CRITICAL: Reads raw body, verifies signature BEFORE any state mutation.
 * Returns non-success on invalid signature. Deduplicates via ProcessedEvent.
 * Triggers welcome email on first subscription activation.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  createServiceClient,
  SupabaseTenantRepository,
} from "@/lib/server/database";
import { WebhookVerificationError, DomainError } from "@/lib/server/errors";
import { getProviders } from "@/lib/server/providers";

export async function POST(request: Request) {
  // Read raw body as text (not parsed JSON) for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: { code: "MISSING_SIGNATURE", message: "Missing stripe-signature header" } },
      { status: 400 }
    );
  }

  // Use the centralized provider system (selects real vs fake based on credentials)
  const { billing } = getProviders();

  // VERIFY SIGNATURE BEFORE ANY STATE MUTATION
  let event;
  try {
    event = billing.verifyWebhook(rawBody, signature);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: error.toSafeResponse().error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: "WEBHOOK_ERROR", message: "Webhook processing failed" } },
      { status: 400 }
    );
  }

  // Only process event AFTER verification succeeds
  try {
    await billing.handleWebhookEvent(event);

    // On first subscription activation (checkout.session.completed),
    // send welcome email
    if (event.type === "checkout.session.completed") {
      await sendWelcomeEmailOnFirstActivation(event.data);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json(
        { error: error.toSafeResponse().error },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Webhook processing failed" } },
      { status: 500 }
    );
  }
}

/**
 * Send welcome email when a subscription is first activated via checkout.
 * This happens after the billing handler has already updated state.
 */
async function sendWelcomeEmailOnFirstActivation(
  data: Record<string, unknown>
) {
  const tenantId = (data.metadata as Record<string, string>)?.tenantId;
  if (!tenantId) return;

  try {
    const serviceClient = createServiceClient();
    const tenantRepo = new SupabaseTenantRepository(serviceClient);
    const tenant = await tenantRepo.findById(tenantId);

    if (!tenant) return;

    // Get the customer email from checkout data
    const customerEmail = data.customer_email as string | undefined;
    if (!customerEmail) return;

    const { mail } = getProviders();
    await mail.sendWelcomeEmail({
      to: customerEmail,
      tenantName: tenant.name,
    });
  } catch {
    // Email failure should not fail the webhook response
    // The subscription state is already committed
    console.error("Failed to send welcome email after checkout");
  }
}
