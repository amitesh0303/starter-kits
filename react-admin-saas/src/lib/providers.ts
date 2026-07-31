/**
 * Provider selection for React SPA.
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

export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;
  const billing: BillingPort = isPlaceholderValue(process.env.STRIPE_SECRET_KEY) ? new FakeBillingAdapter() : new FakeBillingAdapter();
  const mail: MailPort = new FakeMailAdapter();
  cachedProviders = { billing, mail };
  return cachedProviders;
}

export function resetProviders(): void { cachedProviders = null; }
