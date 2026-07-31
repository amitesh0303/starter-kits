/**
 * Unit tests for Paddle billing fake adapter.
 * Tests checkout, webhook verification, event handling, and subscription state machine.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";

const VALID_SECRET = "whsec_test_secret";

describe("FakeBillingAdapter", () => {
  let billing: FakeBillingAdapter;

  beforeEach(() => {
    billing = new FakeBillingAdapter();
  });

  describe("createCheckout", () => {
    it("returns a checkout URL", async () => {
      const url = await billing.createCheckout({
        organizationId: "org_1",
        customerEmail: "test@example.com",
        priceId: "price_1",
        redirectUrl: "http://localhost:3000/dashboard",
      });
      expect(url).toContain("https://checkout.paddle.com/fake/");
    });

    it("stores checkout session", async () => {
      await billing.createCheckout({
        organizationId: "org_1",
        customerEmail: "test@example.com",
        priceId: "price_1",
        redirectUrl: "http://localhost:3000/dashboard",
      });
      expect(billing.checkoutSessions).toHaveLength(1);
      expect(billing.checkoutSessions[0].params.organizationId).toBe("org_1");
    });
  });

  describe("verifyWebhook", () => {
    it("verifies valid signature", () => {
      const event = { id: "evt_1", type: "subscription.created", data: { id: "sub_1" } };
      const rawBody = JSON.stringify(event);
      const result = billing.verifyWebhook(rawBody, VALID_SECRET);
      expect(result.id).toBe("evt_1");
      expect(result.type).toBe("subscription.created");
    });

    it("throws WebhookVerificationError for invalid signature", () => {
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);
      expect(() => billing.verifyWebhook(rawBody, "invalid")).toThrow(
        WebhookVerificationError
      );
    });

    it("throws for empty signature", () => {
      const rawBody = JSON.stringify({ id: "evt_1", type: "test", data: {} });
      expect(() => billing.verifyWebhook(rawBody, "")).toThrow(
        WebhookVerificationError
      );
    });

    it("works with Buffer input", () => {
      const event = { id: "evt_2", type: "subscription.updated", data: {} };
      const rawBody = Buffer.from(JSON.stringify(event));
      const result = billing.verifyWebhook(rawBody, VALID_SECRET);
      expect(result.id).toBe("evt_2");
    });
  });

  describe("handleWebhookEvent - subscription state machine", () => {
    it("subscription.created sets status to active", async () => {
      const event = {
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" }, price_id: "price_1" },
      };
      await billing.handleWebhookEvent(event);
      const sub = billing.subscriptions.get("sub_1");
      expect(sub).toBeDefined();
      expect(sub!.status).toBe("active");
    });

    it("subscription.updated can transition to past_due", async () => {
      // First create subscription
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" } },
      });

      // Update to past_due
      await billing.handleWebhookEvent({
        id: "evt_2",
        type: "subscription.updated",
        data: { id: "sub_1", status: "past_due" },
      });
      expect(billing.subscriptions.get("sub_1")!.status).toBe("past_due");
    });

    it("subscription.updated can transition to trialing", async () => {
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" } },
      });

      await billing.handleWebhookEvent({
        id: "evt_2",
        type: "subscription.updated",
        data: { id: "sub_1", status: "trialing" },
      });
      expect(billing.subscriptions.get("sub_1")!.status).toBe("trialing");
    });

    it("subscription.canceled sets status to cancelled", async () => {
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" } },
      });

      await billing.handleWebhookEvent({
        id: "evt_2",
        type: "subscription.canceled",
        data: { id: "sub_1" },
      });
      expect(billing.subscriptions.get("sub_1")!.status).toBe("cancelled");
    });

    it("unknown event type does not create subscription", async () => {
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "unknown.event",
        data: { id: "sub_1" },
      });
      expect(billing.subscriptions.size).toBe(0);
    });

    it("processes events are tracked", async () => {
      const event = {
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" } },
      };
      await billing.handleWebhookEvent(event);
      expect(billing.processedEvents).toHaveLength(1);
      expect(billing.processedEvents[0].id).toBe("evt_1");
    });
  });

  describe("setWebhookSecret", () => {
    it("allows changing the valid secret", () => {
      billing.setWebhookSecret("new_secret");
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);

      expect(() => billing.verifyWebhook(rawBody, VALID_SECRET)).toThrow(
        WebhookVerificationError
      );
      expect(billing.verifyWebhook(rawBody, "new_secret").id).toBe("evt_1");
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      await billing.createCheckout({
        organizationId: "org_1",
        customerEmail: "test@example.com",
        priceId: "price_1",
        redirectUrl: "http://localhost:3000",
      });
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription.created",
        data: { id: "sub_1", custom_data: { organization_id: "org_1" } },
      });

      billing.reset();
      expect(billing.checkoutSessions).toHaveLength(0);
      expect(billing.processedEvents).toHaveLength(0);
      expect(billing.subscriptions.size).toBe(0);
    });
  });
});
