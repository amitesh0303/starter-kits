/**
 * Billing port: Stripe adapter with webhook verification and payment intent management.
 * WebhookVerifier consumes raw body + signature and MUST verify before any state mutation.
 * Payment state machine: pending | succeeded | failed | refunded
 */

import type { PaymentStatus } from "@/domain/entities";
import {
  BillingError,
  WebhookVerificationError,
  sanitizeProviderError,
} from "./errors";

// --- Billing Port Interface ---

export interface CreatePaymentIntentParams {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BillingPort {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<string>;
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
  refundPayment(paymentIntentId: string): Promise<void>;
}

// --- Stripe Status Mapping ---

function mapStripeStatus(status: string): PaymentStatus {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "requires_payment_method":
    case "requires_confirmation":
    case "processing":
      return "pending";
    case "canceled":
    case "cancelled":
      return "failed";
    default:
      return "pending";
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

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<string> {
    try {
      const response = await fetch(
        "https://api.stripe.com/v1/payment_intents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${this.secretKey}`,
          },
          body: new URLSearchParams({
            amount: params.amount.toString(),
            currency: params.currency,
            "metadata[booking_id]": params.bookingId,
            receipt_email: params.customerEmail,
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new BillingError("Failed to create payment intent");
      }

      const result = await response.json();
      const clientSecret = result?.client_secret;
      if (!clientSecret) {
        throw new BillingError("No client secret in response");
      }
      return clientSecret;
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw sanitizeProviderError(error, "Failed to create payment intent");
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
    const _status = mapStripeStatus(
      (event.data.status as string) ?? "pending"
    );
    // State transitions would be persisted to database in production
    void _status;
  }

  async refundPayment(paymentIntentId: string): Promise<void> {
    try {
      const response = await fetch("https://api.stripe.com/v1/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: new URLSearchParams({
          payment_intent: paymentIntentId,
        }).toString(),
      });

      if (!response.ok) {
        throw new BillingError("Failed to refund payment");
      }
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw sanitizeProviderError(error, "Failed to refund payment");
    }
  }
}
