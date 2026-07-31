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
    expect(typeof policies.canCreateWorkflow).toBe("function");
    expect(typeof policies.canEditWorkflow).toBe("function");
    expect(typeof policies.canTriggerRun).toBe("function");
    expect(typeof policies.canViewRun).toBe("function");
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
    expect(errors.PlanLimitError).toBeDefined();
    expect(errors.RetryExhaustedError).toBeDefined();
  });

  it("fake billing adapter can be imported and instantiated", async () => {
    const { FakeBillingAdapter } = await import("@/lib/server/billing-fake");
    const adapter = new FakeBillingAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.verifyWebhook).toBe("function");
    expect(typeof adapter.handleWebhookEvent).toBe("function");
    expect(typeof adapter.createCheckout).toBe("function");
  });

  it("fake job adapter can be imported and instantiated", async () => {
    const { FakeJobAdapter } = await import("@/lib/server/jobs-fake");
    const adapter = new FakeJobAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.triggerWorkflow).toBe("function");
    expect(typeof adapter.getRunStatus).toBe("function");
  });

  it("database repositories can be imported and instantiated", async () => {
    const db = await import("@/lib/server/database");
    const workflowRepo = new db.InMemoryWorkflowRepository();
    const runRepo = new db.InMemoryRunRepository();
    const stepAttemptRepo = new db.InMemoryStepAttemptRepository();
    const subscriptionRepo = new db.InMemorySubscriptionRepository();
    const eventRepo = new db.InMemoryEventRepository();
    expect(workflowRepo).toBeDefined();
    expect(runRepo).toBeDefined();
    expect(stepAttemptRepo).toBeDefined();
    expect(subscriptionRepo).toBeDefined();
    expect(eventRepo).toBeDefined();
  });

  it("providers module can be imported", async () => {
    const providers = await import("@/lib/server/providers");
    expect(providers).toBeDefined();
    expect(typeof providers.getProviders).toBe("function");
    expect(typeof providers.resetProviders).toBe("function");
  });
});
