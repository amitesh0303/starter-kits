/**
 * Deterministic in-memory fake billing adapter for testing.
 * Stores all operations in memory for assertion in tests.
 */

import type { EntitlementStatus } from "@/domain/entities";
import type { BillingPort, CheckoutParams, WebhookEvent } from "./billing";
import { WebhookVerificationError } from "./errors";

export interface FakeEntitlement {
  id: string;
  status: EntitlementStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  variantId: string;
}

export interface FakeCheckoutSession {
  params: CheckoutParams;
  url: string;
}

export class FakeBillingAdapter implements BillingPort {
  public checkoutSessions: FakeCheckoutSession[] = [];
  public processedEvents: WebhookEvent[] = [];
  public entitlements: Map<string, FakeEntitlement> = new Map();

  private validWebhookSecret = "whsec_test_secret";

  async createCheckout(params: CheckoutParams): Promise<string> {
    const url = `https://checkout.lemonsqueezy.com/fake/${Date.now()}`;
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

    if (event.type === "subscription_created") {
      const subId = (event.data.id as string) ?? `sub_${Date.now()}`;
      this.entitlements.set(subId, {
        id: subId,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        variantId: (event.data.variant_id as string) ?? "variant_1",
      });
    } else if (event.type === "subscription_updated") {
      const subId = event.data.id as string;
      const existing = this.entitlements.get(subId);
      if (existing) {
        const status = event.data.status as string;
        if (status === "active") existing.status = "active";
        else if (status === "past_due") existing.status = "past_due";
        else if (status === "on_trial") existing.status = "trialing";
      }
    } else if (event.type === "subscription_cancelled") {
      const subId = event.data.id as string;
      const existing = this.entitlements.get(subId);
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
   * Add a fake entitlement directly (for testing).
   */
  addEntitlement(id: string, entitlement: FakeEntitlement): void {
    this.entitlements.set(id, entitlement);
  }

  /**
   * Reset all state (for between tests).
   */
  reset(): void {
    this.checkoutSessions = [];
    this.processedEvents = [];
    this.entitlements.clear();
  }
}
