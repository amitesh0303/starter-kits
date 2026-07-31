import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { WebhookVerificationError } from "@/lib/server/errors";

const VALID_SECRET = "whsec_test_secret";

describe("Webhook Authenticity Property", () => {
  it("invalid signature always throws WebhookVerificationError", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (eventId) => {
        const billing = new FakeBillingAdapter();
        const event = { id: eventId, type: "test", data: {} };
        const rawBody = JSON.stringify(event);
        expect(() => billing.verifyWebhook(rawBody, "invalid_" + eventId)).toThrow(WebhookVerificationError);
        expect(billing.subscriptions.size).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it("valid signature verifies successfully", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (eventId) => {
        const billing = new FakeBillingAdapter();
        const event = { id: eventId, type: "checkout.session.completed", data: { subscription: "sub_" + eventId } };
        const rawBody = JSON.stringify(event);
        const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
        expect(verified.id).toBe(eventId);
      }),
      { numRuns: 100 }
    );
  });
});
