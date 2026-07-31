import type { PricingPlan } from "@/domain/entities";

export interface BillingAdapter {
  getPlans(): Promise<PricingPlan[]>;
  createCheckoutSession(planId: string, employerId: string): Promise<{ url: string }>;
}

export function createBillingAdapter(): BillingAdapter {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === "sk_test_placeholder") {
    return createFakeBillingAdapter();
  }

  return createFakeBillingAdapter();
}

function createFakeBillingAdapter(): BillingAdapter {
  const plans: PricingPlan[] = [
    { id: "free", name: "Free", priceInCents: 0, durationDays: 30, featured: false },
    { id: "standard", name: "Standard", priceInCents: 4900, durationDays: 30, featured: false },
    { id: "premium", name: "Premium", priceInCents: 9900, durationDays: 30, featured: true },
  ];

  return {
    async getPlans() {
      return plans;
    },
    async createCheckoutSession(_planId, _employerId) {
      return { url: "https://checkout.stripe.com/fake-session" };
    },
  };
}
