/**
 * Smoke test: verifies key project entry points and module resolution.
 */

import { describe, it, expect } from "vitest";

describe("Smoke Test", () => {
  it("domain entities module can be imported", async () => {
    const entities = await import("@/domain/entities");
    expect(entities).toBeDefined();
  });

  it("domain policies module can be imported", async () => {
    const policies = await import("@/domain/policies");
    expect(policies).toBeDefined();
    expect(typeof policies.canAccessWorkspace).toBe("function");
    expect(typeof policies.canManageWorkspace).toBe("function");
    expect(typeof policies.canGenerate).toBe("function");
  });

  it("server config module can be imported", async () => {
    const config = await import("@/lib/server/config");
    expect(config).toBeDefined();
    expect(typeof config.validateConfig).toBe("function");
    expect(typeof config.isPlaceholderValue).toBe("function");
    expect(typeof config.getRawConfig).toBe("function");
    expect(typeof config.getServerOnlyKeys).toBe("function");
    expect(typeof config.getPublicKeys).toBe("function");
  });

  it("server errors module can be imported", async () => {
    const errors = await import("@/lib/server/errors");
    expect(errors).toBeDefined();
    expect(errors.AuthenticationError).toBeDefined();
    expect(errors.AuthorizationError).toBeDefined();
    expect(errors.WebhookVerificationError).toBeDefined();
    expect(errors.BillingError).toBeDefined();
    expect(errors.AIError).toBeDefined();
  });

  it("fake billing adapter can be imported and instantiated", async () => {
    const { FakeBillingAdapter } = await import("@/lib/server/billing-fake");
    const adapter = new FakeBillingAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.verifyWebhook).toBe("function");
    expect(typeof adapter.handleWebhookEvent).toBe("function");
    expect(typeof adapter.createCheckout).toBe("function");
  });

  it("fake AI adapter can be imported and instantiated", async () => {
    const { FakeAIAdapter } = await import("@/lib/server/ai-fake");
    const adapter = new FakeAIAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.generateResponse).toBe("function");
  });
});
