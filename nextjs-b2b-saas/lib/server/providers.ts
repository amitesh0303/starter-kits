/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeMailAdapter } from "./mail-fake";
import { PaddleBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { PostmarkMailAdapter } from "./mail";
import type { MailPort } from "./mail";

export interface Providers {
  billing: BillingPort;
  mail: MailPort;
}

let cachedProviders: Providers | null = null;

/**
 * Returns the configured providers, selecting fakes when credentials are placeholder values.
 * Providers are cached for the lifetime of the process.
 */
export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;

  const billing = createBillingProvider();
  const mail = createMailProvider();

  cachedProviders = { billing, mail };
  return cachedProviders;
}

/**
 * Reset cached providers (useful for testing).
 */
export function resetProviders(): void {
  cachedProviders = null;
}

function createBillingProvider(): BillingPort {
  const apiKey = process.env.PADDLE_API_KEY;
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (isPlaceholderValue(apiKey) || isPlaceholderValue(webhookSecret)) {
    return new FakeBillingAdapter();
  }

  return new PaddleBillingAdapter(apiKey!, webhookSecret!);
}

function createMailProvider(): MailPort {
  const apiKey = process.env.POSTMARK_API_KEY;

  if (isPlaceholderValue(apiKey)) {
    return new FakeMailAdapter();
  }

  return new PostmarkMailAdapter(apiKey!);
}
