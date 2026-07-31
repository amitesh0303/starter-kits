/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeMailAdapter } from "./mail-fake";
import { FakeCalendarAdapter } from "./calendar-fake";
import { StripeBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { ResendMailAdapter } from "./mail";
import type { MailPort } from "./mail";
import { GoogleCalendarAdapter } from "./calendar";
import type { CalendarPort } from "./calendar";

export interface Providers {
  billing: BillingPort;
  mail: MailPort;
  calendar: CalendarPort;
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
  const calendar = createCalendarProvider();

  cachedProviders = { billing, mail, calendar };
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

function createMailProvider(): MailPort {
  const apiKey = process.env.RESEND_API_KEY;

  if (isPlaceholderValue(apiKey)) {
    return new FakeMailAdapter();
  }

  return new ResendMailAdapter(apiKey!);
}

function createCalendarProvider(): CalendarPort {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (
    isPlaceholderValue(clientId) ||
    isPlaceholderValue(clientSecret) ||
    isPlaceholderValue(refreshToken)
  ) {
    return new FakeCalendarAdapter();
  }

  return new GoogleCalendarAdapter(clientId!, clientSecret!, refreshToken!);
}
