/**
 * Property 5: Webhook authenticity gates one state transition.
 * For any webhook payload and signature:
 * - Invalid proof produces non-success with unchanged state
 * - Valid recognized event produces transition at most once per unique provider_event_id
 * Uses fast-check to generate random payloads/signatures.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";

const VALID_SECRET = "whsec_test_secret";

// Arbitrary generators
const eventIdArb = fc.stringOf(fc.hexa(), {
  minLength: 5,
  maxLength: 30,
});

const eventTypeArb = fc.constantFrom(
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_payment_success",
  "some.unknown.event"
);

const subscriptionIdArb = fc
  .stringOf(fc.hexa(), { minLength: 5, maxLength: 20 })
  .map((s) => `sub_${s}`);

const signatureArb = fc.oneof(
  fc.constant(VALID_SECRET),
  fc.stringOf(fc.hexa(), { minLength: 1, maxLength: 40 })
);

describe("Property 5: Webhook Authenticity Gates One State Transition", () => {
  it("invalid signature always throws WebhookVerificationError with no state change", () => {
    fc.assert(
      fc.property(
        eventIdArb,
        eventTypeArb,
        subscriptionIdArb,
        (eventId, eventType, subId) => {
          const billing = new FakeBillingAdapter();
          const event = {
            id: eventId,
            type: eventType,
            data: { id: subId, variant_id: "var_1" },
          };
          const rawBody = JSON.stringify(event);

          const invalidSig = "definitely_not_valid_" + eventId;

          expect(() => billing.verifyWebhook(rawBody, invalidSig)).toThrow(
            WebhookVerificationError
          );

          // State unchanged: no entitlements created
          expect(billing.entitlements.size).toBe(0);
          expect(billing.processedEvents).toHaveLength(0);
        }
      ),
      { numRuns: 200 }
    );
  });

  it("valid signature with recognized event produces at most one state transition per event ID", async () => {
    await fc.assert(
      fc.asyncProperty(
        eventIdArb,
        subscriptionIdArb,
        async (eventId, subId) => {
          const billing = new FakeBillingAdapter();
          const event = {
            id: eventId,
            type: "subscription_created" as const,
            data: { id: subId, variant_id: "var_1" },
          };
          const rawBody = JSON.stringify(event);

          // Valid signature should verify
          const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
          expect(verified.id).toBe(eventId);

          // Process event (first time)
          await billing.handleWebhookEvent(verified);
          const entAfterFirst = billing.entitlements.get(subId);
          expect(entAfterFirst).toBeDefined();
          expect(entAfterFirst!.status).toBe("active");

          // Process same event again (idempotency)
          await billing.handleWebhookEvent(verified);
          // Entitlement should still be in the same state
          const entAfterSecond = billing.entitlements.get(subId);
          expect(entAfterSecond!.status).toBe("active");
        }
      ),
      { numRuns: 150 }
    );
  });

  it("valid signature with unrecognized event type produces no entitlement state change", async () => {
    await fc.assert(
      fc.asyncProperty(eventIdArb, async (eventId) => {
        const billing = new FakeBillingAdapter();
        const event = {
          id: eventId,
          type: "some.unknown.event",
          data: { foo: "bar" },
        };
        const rawBody = JSON.stringify(event);

        // Valid signature verifies
        const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
        expect(verified.id).toBe(eventId);

        // Process event
        await billing.handleWebhookEvent(verified);
        // No entitlement state created for unknown events
        expect(billing.entitlements.size).toBe(0);
      }),
      { numRuns: 100 }
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
});
