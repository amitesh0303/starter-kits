import { Injectable } from "@nestjs/common";

export interface Subscription {
  tenantId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
}

@Injectable()
export class BillingService {
  private subscriptions: Map<string, Subscription> = new Map();

  createCheckoutSession(tenantId: string, plan: string) {
    return {
      url: `https://checkout.stripe.com/fake?tenant=${tenantId}&plan=${plan}`,
      sessionId: `cs_fake_${Date.now()}`,
    };
  }

  getSubscription(tenantId: string): Subscription {
    return (
      this.subscriptions.get(tenantId) || {
        tenantId,
        plan: "free",
        status: "active",
        currentPeriodEnd: "2025-12-31T23:59:59Z",
      }
    );
  }
}
