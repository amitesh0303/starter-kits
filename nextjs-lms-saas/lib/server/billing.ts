/**
 * Billing port: Stripe adapter with webhook verification for subscription lifecycle.
 * WebhookVerifier consumes raw body + signature and MUST verify before any state mutation.
 * Subscription state machine: active | past_due | cancelled | trialing
 */

import type { SubscriptionStatus } from "@/domain/entities";
import {
  BillingError,
  WebhookVerificationError,
  sanitizeProviderError,
} from "./errors";

// --- Billing Port Interface ---

export interface CreateCheckoutParams {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BillingPort {
  createCheckout(params: CreateCheckoutParams): Promise<string>;
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
}

// --- Stripe Status Mapping ---

export function mapStripeSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
      return "cancelled";
    case "trialing":
      return "trialing";
    default:
      return "active";
  }
}

// --- Stripe Adapter ---

export class StripeBillingAdapter implements BillingPort {
  private secretKey: string;
  private webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckout(params: CreateCheckoutParams): Promise<string> {
    try {
      const response = await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${this.secretKey}`,
          },
          body: new URLSearchParams({
            mode: "subscription",
            "line_items[0][price]": params.priceId,
            "line_items[0][quantity]": "1",
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            "metadata[user_id]": params.userId,
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new BillingError("Failed to create checkout session");
      }

      const result = await response.json();
      const url = result?.url;
      if (!url) {
        throw new BillingError("No checkout URL in response");
      }
      return url;
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw sanitizeProviderError(error, "Failed to create checkout session");
    }
  }

  /**
   * Verify Stripe webhook signature using HMAC-SHA256.
   * Stripe sends the signature in the Stripe-Signature header.
   * Format: t=timestamp,v1=hash
   * Throws WebhookVerificationError if signature is invalid.
   */
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    try {
      const crypto = require("crypto");
      const body =
        typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");

      // Stripe signature format: t=timestamp,v1=hash
      const parts = signature.split(",");
      const tPart = parts.find((p: string) => p.startsWith("t="));
      const v1Part = parts.find((p: string) => p.startsWith("v1="));

      if (!tPart || !v1Part) {
        throw new WebhookVerificationError();
      }

      const timestamp = tPart.replace("t=", "");
      const expectedHash = v1Part.replace("v1=", "");

      const signedPayload = `${timestamp}.${body}`;
      const computedHash = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(signedPayload)
        .digest("hex");

      if (computedHash !== expectedHash) {
        throw new WebhookVerificationError();
      }

      const parsed = JSON.parse(body);
      return {
        id: parsed.id ?? "",
        type: parsed.type ?? "",
        data: parsed.data?.object ?? {},
      };
    } catch (error) {
      if (error instanceof WebhookVerificationError) throw error;
      throw new WebhookVerificationError();
    }
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    const _status = mapStripeSubscriptionStatus(
      (event.data.status as string) ?? "active"
    );
    // State transitions would be persisted to database in production
    void _status;
  }
}
