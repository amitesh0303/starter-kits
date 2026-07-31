/**
 * Provider selection: Chooses real vs fake adapters based on config state.
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

export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;
  const billing = createBillingProvider();
  const mail = createMailProvider();
  cachedProviders = { billing, mail };
  return cachedProviders;
}

export function resetProviders(): void { cachedProviders = null; }

function createBillingProvider(): BillingPort {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhook = process.env.STRIPE_WEBHOOK_SECRET;
  if (isPlaceholderValue(key) || isPlaceholderValue(webhook)) { return new FakeBillingAdapter(); }
  return new PaddleBillingAdapter(key!, webhook!);
}

function createMailProvider(): MailPort {
  const key = process.env.RESEND_API_KEY;
  if (isPlaceholderValue(key)) { return new FakeMailAdapter(); }
  return new PostmarkMailAdapter(key!);
}
