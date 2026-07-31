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
    expect(typeof policies.canUploadFile).toBe("function");
    expect(typeof policies.canStartConversion).toBe("function");
    expect(typeof policies.canDownloadOutput).toBe("function");
    expect(typeof policies.canViewFiles).toBe("function");
    expect(Array.isArray(policies.ALLOWED_MIME_TYPES)).toBe(true);
    expect(typeof policies.MAX_FILE_SIZE_BYTES).toBe("number");
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
    expect(errors.FileSizeError).toBeDefined();
    expect(errors.FileTypeError).toBeDefined();
    expect(errors.QuotaExceededError).toBeDefined();
    expect(errors.RetryExhaustedError).toBeDefined();
  });

  it("fake billing adapter can be imported and instantiated", async () => {
    const { FakeBillingAdapter } = await import("@/lib/server/billing-fake");
    const adapter = new FakeBillingAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.verifyWebhook).toBe("function");
    expect(typeof adapter.handleWebhookEvent).toBe("function");
  });

  it("fake object store adapter can be imported and instantiated", async () => {
    const { FakeObjectStoreAdapter } = await import("@/lib/server/storage-fake");
    const adapter = new FakeObjectStoreAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.uploadFile).toBe("function");
    expect(typeof adapter.deleteFile).toBe("function");
    expect(typeof adapter.getSignedUrl).toBe("function");
  });

  it("fake job adapter can be imported and instantiated", async () => {
    const { FakeJobAdapter } = await import("@/lib/server/jobs-fake");
    const adapter = new FakeJobAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.startConversion).toBe("function");
    expect(typeof adapter.getJobStatus).toBe("function");
  });

  it("database repositories can be imported and instantiated", async () => {
    const db = await import("@/lib/server/database");
    const fileAssetRepo = new db.InMemoryFileAssetRepository();
    const conversionJobRepo = new db.InMemoryConversionJobRepository();
    const outputAssetRepo = new db.InMemoryOutputAssetRepository();
    const subscriptionRepo = new db.InMemorySubscriptionRepository();
    const eventRepo = new db.InMemoryEventRepository();
    expect(fileAssetRepo).toBeDefined();
    expect(conversionJobRepo).toBeDefined();
    expect(outputAssetRepo).toBeDefined();
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
