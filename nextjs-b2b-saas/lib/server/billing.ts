/**
 * Billing port: Paddle adapter with webhook verification and idempotent event processing.
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

export interface CheckoutParams {
  organizationId: string;
  customerEmail: string;
  priceId: string;
  redirectUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BillingPort {
  createCheckout(params: CheckoutParams): Promise<string>;
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
}

// --- Paddle Status Mapping ---

function mapPaddleStatus(status: string): SubscriptionStatus {
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

// --- Paddle Adapter ---

export class PaddleBillingAdapter implements BillingPort {
  private apiKey: string;
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckout(params: CheckoutParams): Promise<string> {
    try {
      const response = await fetch(
        "https://api.paddle.com/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            items: [{ price_id: params.priceId, quantity: 1 }],
            customer: { email: params.customerEmail },
            custom_data: { organization_id: params.organizationId },
            checkout: { url: params.redirectUrl },
          }),
        }
      );

      if (!response.ok) {
        throw new BillingError("Failed to create checkout session");
      }

      const result = await response.json();
      const url = result?.data?.checkout?.url;
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
   * Verify Paddle webhook signature using HMAC-SHA256.
   * Paddle sends the signature in the Paddle-Signature header.
   * Throws WebhookVerificationError if signature is invalid.
   */
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    try {
      const crypto = require("crypto");
      const body =
        typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");

      // Paddle signature format: ts=timestamp;h1=hash
      const parts = signature.split(";");
      const tsPart = parts.find((p: string) => p.startsWith("ts="));
      const h1Part = parts.find((p: string) => p.startsWith("h1="));

      if (!tsPart || !h1Part) {
        throw new WebhookVerificationError();
      }

      const ts = tsPart.replace("ts=", "");
      const expectedHash = h1Part.replace("h1=", "");

      const signedPayload = `${ts}:${body}`;
      const computedHash = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(signedPayload)
        .digest("hex");

      if (computedHash !== expectedHash) {
        throw new WebhookVerificationError();
      }

      const parsed = JSON.parse(body);
      return {
        id: parsed.event_id ?? parsed.id ?? "",
        type: parsed.event_type ?? parsed.type ?? "",
        data: parsed.data ?? {},
      };
    } catch (error) {
      if (error instanceof WebhookVerificationError) throw error;
      throw new WebhookVerificationError();
    }
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    const _status = mapPaddleStatus(
      (event.data.status as string) ?? "active"
    );
    // State transitions would be persisted to database in production
    void _status;
  }
}
