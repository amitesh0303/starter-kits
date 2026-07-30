/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeMailAdapter } from "./mail-fake";
import { StripeBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { ResendMailAdapter } from "./mail";
import type { MailPort } from "./mail";
import {
  createServiceClient,
  SupabaseSubscriptionRepository,
  SupabaseProcessedEventRepository,
} from "./database";

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

  // Real Stripe adapter requires a database connection for repositories
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (isPlaceholderValue(supabaseUrl) || isPlaceholderValue(serviceKey)) {
    return new FakeBillingAdapter();
  }

  // All credentials are real: instantiate the real StripeBillingAdapter
  const serviceClient = createServiceClient();
  const subscriptionRepo = new SupabaseSubscriptionRepository(serviceClient);
  const processedEventRepo = new SupabaseProcessedEventRepository(serviceClient);

  return new StripeBillingAdapter(
    subscriptionRepo,
    processedEventRepo,
    stripeKey!,
    webhookSecret!
  );
}

function createMailProvider(): MailPort {
  const resendKey = process.env.RESEND_API_KEY;

  if (isPlaceholderValue(resendKey)) {
    return new FakeMailAdapter();
  }

  // Real Resend API key present: instantiate the real ResendMailAdapter
  return new ResendMailAdapter(resendKey!);
}
