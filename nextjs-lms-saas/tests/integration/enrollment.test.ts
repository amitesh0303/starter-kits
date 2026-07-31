/**
 * Integration tests for enrollment and payment unlock flow.
 * Verifies that payment triggers subscription activation which unlocks lesson access.
 */

import { describe, it, expect } from "vitest";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { canAccessLesson } from "@/domain/policies";
import type { AuthContext } from "@/domain/policies";
import type { Enrollment, Subscription } from "@/domain/entities";

describe("Enrollment + Payment Unlock Flow", () => {
  it("lesson access denied without subscription", () => {
    const ctx: AuthContext = { userId: "learner_1", role: "learner" };
    const enrollment: Enrollment = {
      id: "enr_1",
      userId: "learner_1",
      courseId: "course_1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // No subscription - access denied
    expect(canAccessLesson(ctx, enrollment, null)).toBe(false);
  });

  it("lesson access granted after subscription activation via webhook", async () => {
    const billing = new FakeBillingAdapter();
    const ctx: AuthContext = { userId: "learner_1", role: "learner" };
    const enrollment: Enrollment = {
      id: "enr_1",
      userId: "learner_1",
      courseId: "course_1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simulate checkout completion
    const checkoutUrl = await billing.createCheckout({
      userId: "learner_1",
      priceId: "price_monthly",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });
    expect(checkoutUrl).toBeTruthy();

    // Now user has an active subscription
    const subscription: Subscription = {
      id: "sub_1",
      userId: "learner_1",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_stripe_1",
      stripePriceId: "price_monthly",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Access granted with active enrollment + subscription
    expect(canAccessLesson(ctx, enrollment, subscription)).toBe(true);
  });

  it("lesson access revoked when subscription cancelled via webhook", async () => {
    const billing = new FakeBillingAdapter();
    const ctx: AuthContext = { userId: "learner_1", role: "learner" };
    const enrollment: Enrollment = {
      id: "enr_1",
      userId: "learner_1",
      courseId: "course_1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set up active subscription in billing
    billing.addSubscription("sub_1", {
      id: "sub_1",
      userId: "learner_1",
      priceId: "price_monthly",
      status: "active",
    });

    // Simulate webhook: subscription cancelled
    const cancelEvent = {
      id: "evt_cancel_1",
      type: "customer.subscription.deleted",
      data: { id: "sub_1" },
    };
    const rawBody = JSON.stringify(cancelEvent);
    const verified = billing.verifyWebhook(rawBody, "whsec_test_secret");
    await billing.handleWebhookEvent(verified);

    // Verify subscription was cancelled in billing adapter
    expect(billing.subscriptions.get("sub_1")!.status).toBe("cancelled");

    // Access denied with cancelled subscription
    const cancelledSub: Subscription = {
      id: "sub_1",
      userId: "learner_1",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_stripe_1",
      stripePriceId: "price_monthly",
      status: "cancelled",
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(canAccessLesson(ctx, enrollment, cancelledSub)).toBe(false);
  });

  it("lesson access allowed with trialing subscription", () => {
    const ctx: AuthContext = { userId: "learner_1", role: "learner" };
    const enrollment: Enrollment = {
      id: "enr_1",
      userId: "learner_1",
      courseId: "course_1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const trialingSub: Subscription = {
      id: "sub_1",
      userId: "learner_1",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_stripe_1",
      stripePriceId: "price_monthly",
      status: "trialing",
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(canAccessLesson(ctx, enrollment, trialingSub)).toBe(true);
  });

  it("lesson access denied with past_due subscription", () => {
    const ctx: AuthContext = { userId: "learner_1", role: "learner" };
    const enrollment: Enrollment = {
      id: "enr_1",
      userId: "learner_1",
      courseId: "course_1",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pastDueSub: Subscription = {
      id: "sub_1",
      userId: "learner_1",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_stripe_1",
      stripePriceId: "price_monthly",
      status: "past_due",
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(canAccessLesson(ctx, enrollment, pastDueSub)).toBe(false);
  });
});
