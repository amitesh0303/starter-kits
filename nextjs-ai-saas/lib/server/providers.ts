/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeAIAdapter } from "./ai-fake";
import { LemonSqueezyBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { OpenAIAdapter } from "./ai";
import type { AIPort } from "./ai";

export interface Providers {
  billing: BillingPort;
  ai: AIPort;
}

let cachedProviders: Providers | null = null;

/**
 * Returns the configured providers, selecting fakes when credentials are placeholder values.
 * Providers are cached for the lifetime of the process.
 */
export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;

  const billing = createBillingProvider();
  const ai = createAIProvider();

  cachedProviders = { billing, ai };
  return cachedProviders;
}

/**
 * Reset cached providers (useful for testing).
 */
export function resetProviders(): void {
  cachedProviders = null;
}

function createBillingProvider(): BillingPort {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (isPlaceholderValue(apiKey) || isPlaceholderValue(webhookSecret)) {
    return new FakeBillingAdapter();
  }

  return new LemonSqueezyBillingAdapter(apiKey!, webhookSecret!);
}

function createAIProvider(): AIPort {
  const apiKey = process.env.OPENAI_API_KEY;

  if (isPlaceholderValue(apiKey)) {
    return new FakeAIAdapter();
  }

  return new OpenAIAdapter(apiKey!);
}
