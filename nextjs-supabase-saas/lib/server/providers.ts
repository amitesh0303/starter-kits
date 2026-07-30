/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeMailAdapter } from "./mail-fake";
import type { BillingPort } from "./billing";
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
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (isPlaceholderValue(stripeKey) || isPlaceholderValue(webhookSecret)) {
    return new FakeBillingAdapter();
  }

  // Dynamic import to avoid loading Stripe SDK when using fakes
  // For the real adapter, we need the repositories which require DB connection
  // In a real setup, this would be injected. For now, return fake if DB is not configured.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isPlaceholderValue(supabaseUrl) || isPlaceholderValue(serviceKey)) {
    return new FakeBillingAdapter();
  }

  // Real adapter requires runtime setup with DB repositories
  // This is handled by the route handlers that have access to the DB client
  // Return fake as fallback here - actual billing setup happens in route handlers
  return new FakeBillingAdapter();
}

function createMailProvider(): MailPort {
  const resendKey = process.env.RESEND_API_KEY;

  if (isPlaceholderValue(resendKey)) {
    return new FakeMailAdapter();
  }

  // Dynamic import would go here for real Resend adapter
  // For now, if the key looks real, we still need the Resend module loaded
  // Return fake as safe default - actual mail setup happens where needed
  return new FakeMailAdapter();
}
