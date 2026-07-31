/**
 * Unit tests for billing adapter (Stripe webhook verification).
 */

import { describe, it, expect } from "vitest";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";
import { mapStripeSubscriptionStatus } from "@/lib/server/billing";

const VALID_SECRET = "whsec_test_secret";

describe("FakeBillingAdapter", () => {
  describe("createCheckout", () => {
    it("returns a checkout URL", async () => {
      const billing = new FakeBillingAdapter();
      const url = await billing.createCheckout({
        userId: "user_1",
        priceId: "price_1",
        successUrl: "http://localhost/success",
        cancelUrl: "http://localhost/cancel",
      });
      expect(url).toContain("https://checkout.stripe.com/test/");
    });

    it("creates a subscription record", async () => {
      const billing = new FakeBillingAdapter();
      await billing.createCheckout({
        userId: "user_1",
        priceId: "price_1",
        successUrl: "http://localhost/success",
        cancelUrl: "http://localhost/cancel",
      });
      expect(billing.subscriptions.size).toBe(1);
      const sub = Array.from(billing.subscriptions.values())[0];
      expect(sub.userId).toBe("user_1");
      expect(sub.status).toBe("active");
    });
  });

  describe("verifyWebhook", () => {
    it("accepts valid signature", () => {
      const billing = new FakeBillingAdapter();
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);

      const result = billing.verifyWebhook(rawBody, VALID_SECRET);
      expect(result.id).toBe("evt_1");
      expect(result.type).toBe("test");
    });

    it("rejects invalid signature", () => {
      const billing = new FakeBillingAdapter();
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);

      expect(() => billing.verifyWebhook(rawBody, "wrong_secret")).toThrow(
        WebhookVerificationError
      );
    });

    it("rejects empty signature", () => {
      const billing = new FakeBillingAdapter();
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);

      expect(() => billing.verifyWebhook(rawBody, "")).toThrow(
        WebhookVerificationError
      );
    });
  });

  describe("handleWebhookEvent", () => {
    it("transitions subscription to cancelled on delete event", async () => {
      const billing = new FakeBillingAdapter();
      billing.addSubscription("sub_1", {
        id: "sub_1",
        userId: "user_1",
        priceId: "price_1",
        status: "active",
      });

      const event = {
        id: "evt_1",
        type: "customer.subscription.deleted",
        data: { id: "sub_1" },
      };

      await billing.handleWebhookEvent(event);
      expect(billing.subscriptions.get("sub_1")!.status).toBe("cancelled");
    });

    it("transitions subscription from active to past_due", async () => {
      const billing = new FakeBillingAdapter();
      billing.addSubscription("sub_1", {
        id: "sub_1",
        userId: "user_1",
        priceId: "price_1",
        status: "active",
      });

      const event = {
        id: "evt_1",
        type: "customer.subscription.updated",
        data: { id: "sub_1", status: "past_due" },
      };

      await billing.handleWebhookEvent(event);
      expect(billing.subscriptions.get("sub_1")!.status).toBe("past_due");
    });

    it("does not transition already cancelled subscription on update", async () => {
      const billing = new FakeBillingAdapter();
      billing.addSubscription("sub_1", {
        id: "sub_1",
        userId: "user_1",
        priceId: "price_1",
        status: "cancelled",
      });

      const event = {
        id: "evt_1",
        type: "customer.subscription.updated",
        data: { id: "sub_1", status: "past_due" },
      };

      await billing.handleWebhookEvent(event);
      // past_due only transitions from active
      expect(billing.subscriptions.get("sub_1")!.status).toBe("cancelled");
    });
  });
});

describe("mapStripeSubscriptionStatus", () => {
  it("maps active", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
  });

  it("maps past_due", () => {
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
  });

  it("maps canceled to cancelled", () => {
    expect(mapStripeSubscriptionStatus("canceled")).toBe("cancelled");
  });

  it("maps trialing", () => {
    expect(mapStripeSubscriptionStatus("trialing")).toBe("trialing");
  });

  it("maps unknown to active", () => {
    expect(mapStripeSubscriptionStatus("unknown")).toBe("active");
  });
});
