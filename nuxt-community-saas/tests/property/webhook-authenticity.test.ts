import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { FakeBillingAdapter } from "@/server/utils/billing-fake";
import { WebhookVerificationError } from "@/server/utils/errors";

describe("Webhook Authenticity", () => {
  it("invalid sig throws", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 20 }), (id) => {
      const b = new FakeBillingAdapter();
      expect(() => b.verifyWebhook(JSON.stringify({ id, type: "t", data: {} }), "bad")).toThrow(WebhookVerificationError);
    }), { numRuns: 50 });
  });
});
