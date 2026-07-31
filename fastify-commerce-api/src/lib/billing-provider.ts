import { isFakeMode } from "./config.js";

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface BillingProvider {
  createCheckoutSession(
    userId: string,
    items: { priceId: string; quantity: number }[]
  ): CheckoutSession;
}

class FakeBillingProvider implements BillingProvider {
  createCheckoutSession(
    userId: string,
    items: { priceId: string; quantity: number }[]
  ): CheckoutSession {
    return {
      url: `https://checkout.stripe.com/fake?user=${userId}&items=${items.length}`,
      sessionId: "cs_fake_" + Date.now(),
    };
  }
}

class StripeBillingProvider implements BillingProvider {
  createCheckoutSession(
    userId: string,
    items: { priceId: string; quantity: number }[]
  ): CheckoutSession {
    // In production, this would call Stripe API
    return {
      url: `https://checkout.stripe.com/pay/${userId}`,
      sessionId: "cs_live_" + Date.now(),
    };
  }
}

export function getBillingProvider(): BillingProvider {
  if (isFakeMode()) {
    return new FakeBillingProvider();
  }
  return new StripeBillingProvider();
}
