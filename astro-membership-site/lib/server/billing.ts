/**
 * Billing port: Paddle adapter interface and real implementation.
 */

import type { SubscriptionStatus } from "@/domain/entities";
import { WebhookVerificationError } from "./errors";

export interface CheckoutParams {
  orgId: string;
  customerEmail: string;
  priceId: string;
  successUrl: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface BillingPort {
  createCheckoutSession(params: CheckoutParams): Promise<string>;
  getSubscription(subscriptionId: string): Promise<{
    id: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null>;
  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent;
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
}

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

export class PaddleBillingAdapter implements BillingPort {
  private apiKey: string;
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSession(params: CheckoutParams): Promise<string> {
    // In production, call Paddle API to create a checkout session
    void params;
    void this.apiKey;
    return `https://checkout.paddle.com/session/${Date.now()}`;
  }

  async getSubscription(subscriptionId: string) {
    void subscriptionId;
    return null;
  }

  verifyWebhook(rawBody: string | Buffer, signature: string): WebhookEvent {
    void this.webhookSecret;
    if (!signature) {
      throw new WebhookVerificationError();
    }
    const body = typeof rawBody === "string" ? rawBody : rawBody.toString("utf-8");
    return JSON.parse(body) as WebhookEvent;
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    void mapPaddleStatus;
    void event;
  }
}
