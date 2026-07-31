/**
 * Property 5: Webhook authenticity gates one state transition (Stripe).
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

// Arbitrary generators
const eventIdArb = fc.stringOf(fc.hexa(), {
  minLength: 5,
  maxLength: 30,
});

const eventTypeArb = fc.constantFrom(
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "some.unknown.event"
);

const paymentIntentIdArb = fc
  .stringOf(fc.hexa(), { minLength: 5, maxLength: 20 })
  .map((s) => `pi_${s}`);

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
        paymentIntentIdArb,
        (eventId, eventType, piId) => {
          const billing = new FakeBillingAdapter();
          const event = {
            id: eventId,
            type: eventType,
            data: { id: piId, payment_intent: piId },
          };
          const rawBody = JSON.stringify(event);

          const invalidSig = "definitely_not_valid_" + eventId;

          expect(() => billing.verifyWebhook(rawBody, invalidSig)).toThrow(
            WebhookVerificationError
          );

          // State unchanged: no payments modified
          expect(billing.payments.size).toBe(0);
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
        paymentIntentIdArb,
        async (eventId, piId) => {
          const billing = new FakeBillingAdapter();

          // Add a pending payment to transition
          billing.addPayment(piId, {
            id: piId,
            bookingId: "book_1",
            amount: 5000,
            currency: "usd",
            status: "pending",
          });

          const event = {
            id: eventId,
            type: "payment_intent.succeeded" as const,
            data: { id: piId, status: "succeeded" },
          };
          const rawBody = JSON.stringify(event);

          // Valid signature should verify
          const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
          expect(verified.id).toBe(eventId);

          // Process event (first time)
          await billing.handleWebhookEvent(verified);
          const payAfterFirst = billing.payments.get(piId);
          expect(payAfterFirst).toBeDefined();
          expect(payAfterFirst!.status).toBe("succeeded");

          // Process same event again (idempotency check)
          await billing.handleWebhookEvent(verified);
          // Payment should still be in the same state (at most one transition)
          const payAfterSecond = billing.payments.get(piId);
          expect(payAfterSecond!.status).toBe("succeeded");
        }
      ),
      { numRuns: 150 }
    );
  });

  it("valid signature with unrecognized event type produces no payment state change", async () => {
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
        // No payment state change for unknown events
        expect(billing.payments.size).toBe(0);
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
