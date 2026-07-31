/**
 * Deterministic in-memory fake Stripe billing adapter for testing.
 * Supports subscription state machine: active, past_due, cancelled, trialing.
 */

import type { SubscriptionStatus } from "@/domain/entities";
import type {
  BillingPort,
  CreateCheckoutParams,
  WebhookEvent,
} from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakeSubscription {
  id: string;
  userId: string;
  priceId: string;
  status: SubscriptionStatus;
}

export class FakeBillingAdapter implements BillingPort {
  public subscriptions: Map<string, FakeSubscription> = new Map();
  public processedEvents: WebhookEvent[] = [];

  private validWebhookSecret = "whsec_test_secret";

  async createCheckout(params: CreateCheckoutParams): Promise<string> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.subscriptions.set(id, {
      id,
      userId: params.userId,
      priceId: params.priceId,
      status: "active",
    });
    return `https://checkout.stripe.com/test/${id}`;
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

    if (event.type === "customer.subscription.updated") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      const newStatus = event.data.status as string;

      if (existing) {
        if (newStatus === "active" && existing.status !== "active") {
          existing.status = "active";
        } else if (newStatus === "past_due" && existing.status === "active") {
          existing.status = "past_due";
        } else if (
          (newStatus === "canceled" || newStatus === "cancelled") &&
          existing.status !== "cancelled"
        ) {
          existing.status = "cancelled";
        } else if (newStatus === "trialing" && existing.status !== "trialing") {
          existing.status = "trialing";
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing && existing.status !== "cancelled") {
        existing.status = "cancelled";
      }
    }
  }

  /**
   * Set the valid webhook secret for testing.
   */
  setWebhookSecret(secret: string): void {
    this.validWebhookSecret = secret;
  }

  /**
   * Add a fake subscription directly (for testing).
   */
  addSubscription(id: string, subscription: FakeSubscription): void {
    this.subscriptions.set(id, subscription);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.subscriptions.clear();
    this.processedEvents = [];
  }
}
