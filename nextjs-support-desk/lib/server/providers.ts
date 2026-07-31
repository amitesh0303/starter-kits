/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeObjectStoreAdapter } from "./storage-fake";
import { FakeMailAdapter } from "./mail-fake";
import { R2ObjectStoreAdapter } from "./storage";
import type { ObjectStorePort } from "./storage";
import { ResendMailAdapter } from "./mail";
import type { MailPort } from "./mail";

export interface Providers {
  storage: ObjectStorePort;
  mail: MailPort;
}

let cachedProviders: Providers | null = null;

/**
 * Returns the configured providers, selecting fakes when credentials are placeholder values.
 * Providers are cached for the lifetime of the process.
 */
export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;

  const storage = createStorageProvider();
  const mail = createMailProvider();

  cachedProviders = { storage, mail };
  return cachedProviders;
}

/**
 * Reset cached providers (useful for testing).
 */
export function resetProviders(): void {
  cachedProviders = null;
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

function createMailProvider(): MailPort {
  const apiKey = process.env.RESEND_API_KEY;

  if (isPlaceholderValue(apiKey)) {
    return new FakeMailAdapter();
  }

  return new ResendMailAdapter(apiKey!);
}
