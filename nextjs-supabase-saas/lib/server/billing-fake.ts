/**
 * Deterministic in-memory fake billing adapter for testing.
 * Stores all operations in memory for assertion in tests.
 */

import type { SubscriptionStatus } from "@/domain/entities";
import type {
  BillingPort,
  CheckoutSessionParams,
  BillingPortalParams,
  WebhookEvent,
} from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakeCustomer {
  id: string;
  email: string;
  tenantId: string;
}

export interface FakeCheckoutSession {
  params: CheckoutSessionParams;
  url: string;
}

export interface FakeSubscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  priceId: string;
}

export class FakeBillingAdapter implements BillingPort {
  public customers: FakeCustomer[] = [];
  public checkoutSessions: FakeCheckoutSession[] = [];
  public processedEvents: WebhookEvent[] = [];
  public subscriptions: Map<string, FakeSubscription> = new Map();

  private customerCounter = 0;
  private validWebhookSecret = "whsec_test_secret";

  async createCustomer(email: string, tenantId: string): Promise<string> {
    this.customerCounter++;
    const id = `cus_fake_${this.customerCounter}`;
    this.customers.push({ id, email, tenantId });
    return id;
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
    const url = `https://checkout.stripe.com/fake/${Date.now()}`;
    this.checkoutSessions.push({ params, url });
    return url;
  }

  async createBillingPortalSession(
    params: BillingPortalParams
  ): Promise<string> {
    return `https://billing.stripe.com/fake/portal?customer=${params.customerId}&return=${params.returnUrl}`;
  }

  async getSubscription(subscriptionId: string) {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) return null;
    return sub;
  }

  /**
   * Fake webhook verification. Expects "valid_signature" as the signature string.
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

    if (event.type === "checkout.session.completed") {
      const subId = event.data.subscription as string;
      if (subId) {
        this.subscriptions.set(subId, {
          id: subId,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          priceId: "price_fake_123",
        });
      }
    } else if (event.type === "customer.subscription.updated") {
      const subId = event.data.id as string;
      const existing = this.subscriptions.get(subId);
      if (existing) {
        existing.status = (event.data.status as SubscriptionStatus) ?? existing.status;
      }
    } else if (event.type === "customer.subscription.deleted") {
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
  addSubscription(id: string, sub: FakeSubscription): void {
    this.subscriptions.set(id, sub);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.customers = [];
    this.checkoutSessions = [];
    this.processedEvents = [];
    this.subscriptions.clear();
    this.customerCounter = 0;
  }
}
