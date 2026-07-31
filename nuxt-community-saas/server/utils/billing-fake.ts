/**
 * Deterministic in-memory fake billing adapter for testing.
 */

import type { SubscriptionStatus } from "@/domain/entities";
import type { BillingPort, CheckoutParams, WebhookEvent } from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakeSubscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export class FakeBillingAdapter implements BillingPort {
  public checkoutSessions: CheckoutParams[] = [];
  public processedEvents: WebhookEvent[] = [];
  public subscriptions: Map<string, FakeSubscription> = new Map();
  private validWebhookSecret = "whsec_test_secret";

  async createCheckoutSession(params: CheckoutParams): Promise<string> {
    this.checkoutSessions.push(params);
    return `https://checkout.paddle.com/fake/${Date.now()}`;
  }

  async getSubscription(subscriptionId: string) {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) return null;
    return sub;
  }

  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    if (signature !== this.validWebhookSecret) {
      throw new WebhookVerificationError();
    }
    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    return JSON.parse(body) as WebhookEvent;
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    this.processedEvents.push(event);

    if (event.type === "subscription.created" || event.type === "subscription.activated") {
      const subId = (event.data.id as string) || `sub_${Date.now()}`;
      this.subscriptions.set(subId, {
        id: subId,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      });
    } else if (event.type === "subscription.updated") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing) {
        existing.status = (event.data.status as SubscriptionStatus) ?? existing.status;
      }
    } else if (event.type === "subscription.cancelled") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing) {
        existing.status = "cancelled";
      }
    }
  }

  setWebhookSecret(secret: string): void {
    this.validWebhookSecret = secret;
  }

  reset(): void {
    this.checkoutSessions = [];
    this.processedEvents = [];
    this.subscriptions.clear();
  }
}
