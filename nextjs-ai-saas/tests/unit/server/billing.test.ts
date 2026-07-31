/**
 * Unit tests for the fake billing adapter.
 * Tests verification, event handling, and deduplication.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";

describe("FakeBillingAdapter", () => {
  let billing: FakeBillingAdapter;

  beforeEach(() => {
    billing = new FakeBillingAdapter();
  });

  describe("createCheckout", () => {
    it("returns a checkout URL", async () => {
      const url = await billing.createCheckout({
        workspaceId: "ws_1",
        customerEmail: "test@example.com",
        variantId: "variant_1",
        redirectUrl: "http://localhost:3000/billing",
      });
      expect(url).toContain("https://checkout.lemonsqueezy.com/fake/");
      expect(billing.checkoutSessions).toHaveLength(1);
    });
  });

  describe("verifyWebhook", () => {
    it("verifies valid signature", () => {
      const event = { id: "evt_1", type: "subscription_created", data: { id: "sub_1" } };
      const rawBody = JSON.stringify(event);
      const result = billing.verifyWebhook(rawBody, "whsec_test_secret");
      expect(result.id).toBe("evt_1");
      expect(result.type).toBe("subscription_created");
    });

    it("rejects invalid signature", () => {
      const event = { id: "evt_1", type: "subscription_created", data: {} };
      const rawBody = JSON.stringify(event);
      expect(() => billing.verifyWebhook(rawBody, "invalid_sig")).toThrow(
        WebhookVerificationError
      );
    });

    it("allows custom webhook secret", () => {
      billing.setWebhookSecret("custom_secret");
      const event = { id: "evt_1", type: "test", data: {} };
      const rawBody = JSON.stringify(event);
      const result = billing.verifyWebhook(rawBody, "custom_secret");
      expect(result.id).toBe("evt_1");
    });
  });

  describe("handleWebhookEvent", () => {
    it("handles subscription_created event", async () => {
      const event = {
        id: "evt_1",
        type: "subscription_created",
        data: { id: "sub_1", variant_id: "var_1" },
      };
      await billing.handleWebhookEvent(event);
      expect(billing.entitlements.has("sub_1")).toBe(true);
      expect(billing.entitlements.get("sub_1")!.status).toBe("active");
    });

    it("handles subscription_updated event", async () => {
      // First create the subscription
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription_created",
        data: { id: "sub_1", variant_id: "var_1" },
      });

      // Then update it
      await billing.handleWebhookEvent({
        id: "evt_2",
        type: "subscription_updated",
        data: { id: "sub_1", status: "past_due" },
      });

      expect(billing.entitlements.get("sub_1")!.status).toBe("past_due");
    });

    it("handles subscription_cancelled event", async () => {
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription_created",
        data: { id: "sub_1", variant_id: "var_1" },
      });

      await billing.handleWebhookEvent({
        id: "evt_2",
        type: "subscription_cancelled",
        data: { id: "sub_1" },
      });

      expect(billing.entitlements.get("sub_1")!.status).toBe("cancelled");
    });

    it("tracks processed events", async () => {
      const event = { id: "evt_1", type: "subscription_created", data: { id: "sub_1" } };
      await billing.handleWebhookEvent(event);
      expect(billing.processedEvents).toHaveLength(1);
      expect(billing.processedEvents[0].id).toBe("evt_1");
    });

    it("processes duplicate events (deduplication at adapter level)", async () => {
      const event = {
        id: "evt_1",
        type: "subscription_created",
        data: { id: "sub_1", variant_id: "var_1" },
      };
      await billing.handleWebhookEvent(event);
      await billing.handleWebhookEvent(event);
      expect(billing.processedEvents).toHaveLength(2);
      // Entitlement is still the same (idempotent by overwrite)
      expect(billing.entitlements.size).toBe(1);
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      await billing.createCheckout({
        workspaceId: "ws_1",
        customerEmail: "test@example.com",
        variantId: "variant_1",
        redirectUrl: "http://localhost:3000",
      });
      await billing.handleWebhookEvent({
        id: "evt_1",
        type: "subscription_created",
        data: { id: "sub_1" },
      });

      billing.reset();

      expect(billing.checkoutSessions).toHaveLength(0);
      expect(billing.processedEvents).toHaveLength(0);
      expect(billing.entitlements.size).toBe(0);
    });
  });
});
