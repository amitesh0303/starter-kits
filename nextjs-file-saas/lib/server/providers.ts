/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { StripeBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { FakeObjectStoreAdapter } from "./storage-fake";
import { R2ObjectStoreAdapter } from "./storage";
import type { ObjectStorePort } from "./storage";
import { FakeJobAdapter } from "./jobs-fake";
import { InngestAdapter } from "./jobs";
import type { JobPort } from "./jobs";
import {
  InMemoryConversionJobRepository,
  InMemoryOutputAssetRepository,
} from "./database";

export interface Providers {
  billing: BillingPort;
  storage: ObjectStorePort;
  jobs: JobPort;
}

let cachedProviders: Providers | null = null;

/**
 * Returns the configured providers, selecting fakes when credentials are placeholder values.
 * Providers are cached for the lifetime of the process.
 */
export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;

  const billing = createBillingProvider();
  const storage = createStorageProvider();
  const jobs = createJobsProvider();

  cachedProviders = { billing, storage, jobs };
  return cachedProviders;
}

/**
 * Reset cached providers (useful for testing).
 */
export function resetProviders(): void {
  cachedProviders = null;
}

function createBillingProvider(): BillingPort {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (isPlaceholderValue(secretKey) || isPlaceholderValue(webhookSecret)) {
    return new FakeBillingAdapter();
  }

  return new StripeBillingAdapter(secretKey!, webhookSecret!);
}

function createStorageProvider(): ObjectStorePort {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (
    isPlaceholderValue(accountId) ||
    isPlaceholderValue(accessKeyId) ||
    isPlaceholderValue(secretAccessKey) ||
    isPlaceholderValue(bucketName) ||
    isPlaceholderValue(publicUrl)
  ) {
    return new FakeObjectStoreAdapter();
  }

  return new R2ObjectStoreAdapter({
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucketName: bucketName!,
    publicUrl: publicUrl!,
  });
}

function createJobsProvider(): JobPort {
  const eventKey = process.env.INNGEST_EVENT_KEY;
  const signingKey = process.env.INNGEST_SIGNING_KEY;

  if (isPlaceholderValue(eventKey) || isPlaceholderValue(signingKey)) {
    return new FakeJobAdapter();
  }

  const { Inngest } = require("inngest");
  const client = new Inngest({ id: "file-saas", eventKey });
  return new InngestAdapter(
    client,
    new InMemoryConversionJobRepository(),
    new InMemoryOutputAssetRepository()
  );
}
