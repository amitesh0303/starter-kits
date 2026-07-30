/**
 * Billing port: Stripe adapter with webhook verification and idempotent event processing.
 * WebhookVerifier consumes raw body + headers and MUST verify before any state mutation.
 * Subscription state machine: active | past_due | cancelled | trialing
 */

import Stripe from "stripe";
import type { SubscriptionStatus } from "@/domain/entities";
import type { ProcessedEventRepository, SubscriptionRepository } from "./database";
import {
  BillingError,
  WebhookVerificationError,
  sanitizeProviderError,
} from "./errors";

// ─── Billing Port Interface ─────────────────────────────────────────────────────

export interface CheckoutSessionParams {
  tenantId: string;
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingPortalParams {
  customerId: string;
  returnUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BillingPort {
  createCustomer(email: string, tenantId: string): Promise<string>;
  createCheckoutSession(params: CheckoutSessionParams): Promise<string>;
  createBillingPortalSession(params: BillingPortalParams): Promise<string>;
  getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    priceId: string;
  } | null>;
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
}

// ─── Stripe Status Mapping ──────────────────────────────────────────────────────

function mapStripeStatus(status: string): SubscriptionStatus {
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

// ─── Stripe Adapter ─────────────────────────────────────────────────────────────

export class StripeBillingAdapter implements BillingPort {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private subscriptionRepo: SubscriptionRepository,
    private processedEventRepo: ProcessedEventRepository,
    stripeSecretKey: string,
    webhookSecret: string
  ) {
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
    this.webhookSecret = webhookSecret;
  }

  async createCustomer(email: string, tenantId: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata: { tenantId },
      });
      return customer.id;
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to create billing customer");
    }
  }

  async createCheckoutSession(params: CheckoutSessionParams): Promise<string> {
    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "subscription",
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: { tenantId: params.tenantId },
      };

      if (params.customerId) {
        sessionParams.customer = params.customerId;
      } else if (params.customerEmail) {
        sessionParams.customer_email = params.customerEmail;
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);
      if (!session.url) {
        throw new BillingError("Failed to create checkout session URL");
      }
      return session.url;
    } catch (error) {
      if (error instanceof BillingError) throw error;
      throw sanitizeProviderError(
        error,
        "Failed to create billing checkout session"
      );
    }
  }

  async createBillingPortalSession(
    params: BillingPortalParams
  ): Promise<string> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: params.customerId,
        return_url: params.returnUrl,
      });
      return session.url;
    } catch (error) {
      throw sanitizeProviderError(
        error,
        "Failed to create billing portal session"
      );
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
      return {
        id: sub.id,
        status: mapStripeStatus(sub.status),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        priceId: sub.items.data[0]?.price?.id ?? "",
      };
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to retrieve subscription");
    }
  }

  /**
   * Verify webhook signature BEFORE any state mutation.
   * Throws WebhookVerificationError if signature is invalid.
   */
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret
      );
      return {
        id: event.id,
        type: event.type,
        data: event.data.object as unknown as Record<string, unknown>,
      };
    } catch {
      throw new WebhookVerificationError();
    }
  }

  /**
   * Handle a verified webhook event with idempotent processing.
   * Checks ProcessedEvent table before state mutations.
   */
  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    // Idempotency: skip if already processed
    const alreadyProcessed = await this.processedEventRepo.exists(event.id);
    if (alreadyProcessed) return;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutCompleted(event.data);
          break;
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data);
          break;
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data);
          break;
        default:
          // Unknown events are silently ignored (not an error)
          break;
      }

      // Record successful processing (commit point)
      await this.processedEventRepo.create({
        providerEventId: event.id,
        eventType: event.type,
      });
    } catch (error) {
      // Re-throw domain errors, sanitize others
      if (error instanceof BillingError) throw error;
      throw sanitizeProviderError(error, "Failed to process webhook event");
    }
  }

  private async handleCheckoutCompleted(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscriptionId = data.subscription as string;
    const customerId = data.customer as string;
    const tenantId = (data.metadata as Record<string, string>)?.tenantId;

    if (!subscriptionId || !customerId || !tenantId) {
      throw new BillingError("Missing required checkout session data");
    }

    // Fetch full subscription details from Stripe
    const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id ?? "";

    await this.subscriptionRepo.upsertByStripeSubscriptionId({
      tenantId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: priceId,
      status: mapStripeStatus(sub.status),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  }

  private async handleSubscriptionUpdated(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscriptionId = data.id as string;
    const status = data.status as string;
    const currentPeriodEnd = data.current_period_end as number;
    const cancelAtPeriodEnd = data.cancel_at_period_end as boolean;

    if (!subscriptionId || !status) {
      throw new BillingError("Missing required subscription update data");
    }

    await this.subscriptionRepo.updateStatus(subscriptionId, {
      status: mapStripeStatus(status),
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : undefined,
      cancelAtPeriodEnd,
    });
  }

  private async handleSubscriptionDeleted(
    data: Record<string, unknown>
  ): Promise<void> {
    const subscriptionId = data.id as string;

    if (!subscriptionId) {
      throw new BillingError("Missing subscription ID in deletion event");
    }

    await this.subscriptionRepo.updateStatus(subscriptionId, {
      status: "cancelled",
      cancelAtPeriodEnd: false,
    });
  }
}
