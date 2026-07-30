/**
 * Deterministic in-memory fake Paddle billing adapter for testing.
 * Supports subscription state machine: active, past_due, cancelled, trialing.
 */

import type { SubscriptionStatus } from "@/domain/entities";
import type { BillingPort, CheckoutParams, WebhookEvent } from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakeSubscription {
  id: string;
  organizationId: string;
  status: SubscriptionStatus;
  priceId: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface FakeCheckoutSession {
  params: CheckoutParams;
  url: string;
}

export class FakeBillingAdapter implements BillingPort {
  public checkoutSessions: FakeCheckoutSession[] = [];
  public processedEvents: WebhookEvent[] = [];
  public subscriptions: Map<string, FakeSubscription> = new Map();

  private validWebhookSecret = "whsec_test_secret";

  async createCheckout(params: CheckoutParams): Promise<string> {
    const url = `https://checkout.paddle.com/fake/${Date.now()}`;
    this.checkoutSessions.push({ params, url });
    return url;
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

    if (event.type === "subscription.created") {
      const subId = (event.data.id as string) ?? `sub_${Date.now()}`;
      this.subscriptions.set(subId, {
        id: subId,
        organizationId: (event.data.custom_data as Record<string, string>)?.organization_id ?? "",
        status: "active",
        priceId: (event.data.price_id as string) ?? "price_1",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      });
    } else if (event.type === "subscription.updated") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing) {
        const status = event.data.status as string;
        if (status === "active") existing.status = "active";
        else if (status === "past_due") existing.status = "past_due";
        else if (status === "trialing") existing.status = "trialing";
      }
    } else if (event.type === "subscription.canceled") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing) {
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
    this.checkoutSessions = [];
    this.processedEvents = [];
    this.subscriptions.clear();
  }
}
