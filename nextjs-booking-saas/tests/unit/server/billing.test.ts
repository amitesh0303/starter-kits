/**
 * Unit tests for the Stripe billing adapter webhook verification.
 */

import { describe, it, expect } from "vitest";
import * as crypto from "crypto";
import { StripeBillingAdapter } from "@/lib/server/billing";
import { WebhookVerificationError } from "@/lib/server/errors";

const WEBHOOK_SECRET = "whsec_test_secret_key";

function createValidSignature(body: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedPayload = `${timestamp}.${body}`;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  return `t=${timestamp},v1=${hash}`;
}

describe("StripeBillingAdapter.verifyWebhook", () => {
  const adapter = new StripeBillingAdapter("sk_test_key", WEBHOOK_SECRET);

  it("verifies valid signature and returns parsed event", () => {
    const body = JSON.stringify({
      id: "evt_123",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_456", status: "succeeded" } },
    });
    const signature = createValidSignature(body, WEBHOOK_SECRET);

    const event = adapter.verifyWebhook(body, signature);
    expect(event.id).toBe("evt_123");
    expect(event.type).toBe("payment_intent.succeeded");
    expect(event.data.id).toBe("pi_456");
  });

  it("throws WebhookVerificationError on invalid signature", () => {
    const body = JSON.stringify({ id: "evt_123", type: "test", data: { object: {} } });
    const signature = "t=12345,v1=invalid_hash_value";

    expect(() => adapter.verifyWebhook(body, signature)).toThrow(
      WebhookVerificationError
    );
  });

  it("throws WebhookVerificationError on missing signature parts", () => {
    const body = JSON.stringify({ id: "evt_123", type: "test", data: { object: {} } });

    expect(() => adapter.verifyWebhook(body, "")).toThrow(
      WebhookVerificationError
    );
    expect(() => adapter.verifyWebhook(body, "t=12345")).toThrow(
      WebhookVerificationError
    );
    expect(() => adapter.verifyWebhook(body, "v1=hash")).toThrow(
      WebhookVerificationError
    );
  });

  it("throws WebhookVerificationError on tampered body", () => {
    const originalBody = JSON.stringify({ id: "evt_123", type: "test", data: { object: {} } });
    const signature = createValidSignature(originalBody, WEBHOOK_SECRET);

    const tamperedBody = JSON.stringify({ id: "evt_123", type: "hack", data: { object: {} } });
    expect(() => adapter.verifyWebhook(tamperedBody, signature)).toThrow(
      WebhookVerificationError
    );
  });

  it("throws WebhookVerificationError on wrong secret", () => {
    const body = JSON.stringify({ id: "evt_123", type: "test", data: { object: {} } });
    const signature = createValidSignature(body, "wrong_secret");

    expect(() => adapter.verifyWebhook(body, signature)).toThrow(
      WebhookVerificationError
    );
  });
});
