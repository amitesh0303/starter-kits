import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeBillingAdapter } from "@/lib/billing-fake";
import { WebhookVerificationError } from "@/lib/errors";

const VALID_SECRET = "whsec_test_secret";

describe("Webhook Authenticity Property", () => {
  it("invalid signature always throws", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (eventId) => {
        const billing = new FakeBillingAdapter();
        const rawBody = JSON.stringify({ id: eventId, type: "test", data: {} });
        expect(() => billing.verifyWebhook(rawBody, "invalid_" + eventId)).toThrow(WebhookVerificationError);
      }),
      { numRuns: 100 }
    );
  });

  it("valid signature verifies", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 20 }), (eventId) => {
        const billing = new FakeBillingAdapter();
        const rawBody = JSON.stringify({ id: eventId, type: "test", data: {} });
        const verified = billing.verifyWebhook(rawBody, VALID_SECRET);
        expect(verified.id).toBe(eventId);
      }),
      { numRuns: 100 }
    );
  });
});
