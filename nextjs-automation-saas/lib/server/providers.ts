/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { StripeBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { FakeJobAdapter } from "./jobs-fake";
import { InngestAdapter } from "./jobs";
import type { JobPort } from "./jobs";
import { InMemoryRunRepository, InMemoryStepAttemptRepository } from "./database";

export interface Providers {
  billing: BillingPort;
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
  const jobs = createJobsProvider();

  cachedProviders = { billing, jobs };
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

function createJobsProvider(): JobPort {
  const eventKey = process.env.INNGEST_EVENT_KEY;
  const signingKey = process.env.INNGEST_SIGNING_KEY;

  if (isPlaceholderValue(eventKey) || isPlaceholderValue(signingKey)) {
    return new FakeJobAdapter();
  }

  const { Inngest } = require("inngest");
  const client = new Inngest({ id: "automation-saas", eventKey });
  return new InngestAdapter(
    client,
    new InMemoryRunRepository(),
    new InMemoryStepAttemptRepository()
  );
}
