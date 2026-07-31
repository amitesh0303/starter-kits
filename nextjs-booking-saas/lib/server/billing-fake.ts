/**
 * Deterministic in-memory fake Stripe billing adapter for testing.
 * Supports payment state machine: pending, succeeded, failed, refunded.
 */

import type { PaymentStatus } from "@/domain/entities";
import type {
  BillingPort,
  CreatePaymentIntentParams,
  WebhookEvent,
} from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakePayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export class FakeBillingAdapter implements BillingPort {
  public payments: Map<string, FakePayment> = new Map();
  public processedEvents: WebhookEvent[] = [];
  public refundedIntents: string[] = [];

  private validWebhookSecret = "whsec_test_secret";

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<string> {
    const id = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.payments.set(id, {
      id,
      bookingId: params.bookingId,
      amount: params.amount,
      currency: params.currency,
      status: "pending",
    });
    return `${id}_secret_test`;
  }

  /**
   * Fake webhook verification. Expects validWebhookSecret as the signature string.
   * Any other signature throws WebhookVerificationError.
   */
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    if (signature !== this.validWebhookSecret) {
      throw new WebhookVerificationError();
    }

    const body =
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    const parsed = JSON.parse(body) as WebhookEvent;
    return parsed;
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    this.processedEvents.push(event);

    if (event.type === "payment_intent.succeeded") {
      const piId = event.data.id as string;
      const existing = this.payments.get(piId);
      if (existing && existing.status === "pending") {
        existing.status = "succeeded";
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const piId = event.data.id as string;
      const existing = this.payments.get(piId);
      if (existing && existing.status === "pending") {
        existing.status = "failed";
      }
    } else if (event.type === "charge.refunded") {
      const piId = event.data.payment_intent as string;
      const existing = this.payments.get(piId);
      if (existing && existing.status === "succeeded") {
        existing.status = "refunded";
      }
    }
  }

  async refundPayment(paymentIntentId: string): Promise<void> {
    this.refundedIntents.push(paymentIntentId);
    const existing = this.payments.get(paymentIntentId);
    if (existing) {
      existing.status = "refunded";
    }
  }

  /**
   * Set the valid webhook secret for testing.
   */
  setWebhookSecret(secret: string): void {
    this.validWebhookSecret = secret;
  }

  /**
   * Add a fake payment directly (for testing).
   */
  addPayment(id: string, payment: FakePayment): void {
    this.payments.set(id, payment);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.payments.clear();
    this.processedEvents = [];
    this.refundedIntents = [];
  }
}
