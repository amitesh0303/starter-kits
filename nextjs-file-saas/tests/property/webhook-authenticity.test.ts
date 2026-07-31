/**
 * Feature: multi-stack-boilerplates, Property 5: Webhook authenticity gates one state transition.
 * For any webhook payload and signature:
 * - Invalid proof produces non-success with unchanged state
 * - Valid recognized event produces transition at most once per unique event ID
 * Uses fast-check to generate random payloads/signatures.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";

const VALID_SECRET = "whsec_test_secret";

const eventIdArb = fc.stringOf(fc.hexa(), { minLength: 5, maxLength: 30 });

const subIdArb = fc
  .stringOf(fc.hexa(), { minLength: 5, maxLength: 20 })
  .map((s) => `sub_${s}`);

const signatureArb = fc.oneof(
  fc.constant(VALID_SECRET),
  fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 40 })
);

describe("Property 5: Webhook Authenticity Gates One State Transition", () => {
  it("invalid signature always throws WebhookVerificationError with no state change", () => {
    fc.assert(
      fc.property(eventIdArb, subIdArb, (eventId, subId) => {
        const billing = new FakeBillingAdapter();
        billing.addSubscription(subId, {
          id: subId,
          userId: "user_1",
          priceId: "price_1",
          status: "active",
        });

        const event = {
          id: eventId,
          type: "customer.subscription.updated",
          data: { id: subId, status: "past_due" },
        };
        const rawBody = JSON.stringify(event);
        const invalidSig = "definitely_not_valid_" + eventId;

        expect(() => billing.verifyWebhook(rawBody, invalidSig)).toThrow(
          WebhookVerificationError
        );

        // State unchanged: subscription still active, no events processed
        expect(billing.subscriptions.get(subId)!.status).toBe("active");
        expect(billing.processedEvents).toHaveLength(0);
      }),
      { numRuns: 200 }
    );
  });

  it("valid signature with recognized event produces at most one state transition per event ID", async () => {
    await fc.assert(
      fc.asyncProperty(eventIdArb, subIdArb, async (eventId, subId) => {
        const billing = new FakeBillingAdapter();
        billing.addSubscription(subId, {
          id: subId,
          userId: "user_1",
          priceId: "price_1",
          status: "active",
        });

        const event = {
          id: eventId,
          type: "customer.subscription.updated" as const,
          data: { id: subId, status: "past_due" },
        };
        const rawBody = JSON.stringify(event);

        const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
        expect(verified.id).toBe(eventId);

        await billing.handleWebhookEvent(verified);
        expect(billing.subscriptions.get(subId)!.status).toBe("past_due");

        // Processing the same event again should not cause a further transition
        // (idempotent from active->past_due; already past_due).
        await billing.handleWebhookEvent(verified);
        expect(billing.subscriptions.get(subId)!.status).toBe("past_due");
      }),
      { numRuns: 150 }
    );
  });

  it("random signatures only pass if they match the valid secret exactly", () => {
    fc.assert(
      fc.property(eventIdArb, signatureArb, (eventId, signature) => {
        const billing = new FakeBillingAdapter();
        const event = { id: eventId, type: "test", data: {} };
        const rawBody = JSON.stringify(event);

        if (signature === VALID_SECRET) {
          const result = billing.verifyWebhook(rawBody, signature);
          expect(result.id).toBe(eventId);
        } else {
          expect(() => billing.verifyWebhook(rawBody, signature)).toThrow(
            WebhookVerificationError
          );
        }
      }),
      { numRuns: 200 }
    );
  });

  it("valid signature with unrecognized subscription id produces no state change", async () => {
    await fc.assert(
      fc.asyncProperty(eventIdArb, subIdArb, async (eventId, subId) => {
        const billing = new FakeBillingAdapter();
        // No subscription registered for subId.
        const event = {
          id: eventId,
          type: "customer.subscription.updated",
          data: { id: subId, status: "past_due" },
        };
        const rawBody = JSON.stringify(event);

        const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
        await billing.handleWebhookEvent(verified);

        expect(billing.subscriptions.size).toBe(0);
      }),
      { numRuns: 100 }
    );
  });
});
