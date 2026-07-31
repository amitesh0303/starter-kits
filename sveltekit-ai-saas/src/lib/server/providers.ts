/**
 * Provider selection.
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
  const billing: BillingPort = isPlaceholderValue(process.env.STRIPE_SECRET_KEY) ? new FakeBillingAdapter() : new PaddleBillingAdapter(process.env.STRIPE_SECRET_KEY!, process.env.STRIPE_WEBHOOK_SECRET!);
  const mail: MailPort = isPlaceholderValue(process.env.AI_API_KEY) ? new FakeMailAdapter() : new PostmarkMailAdapter(process.env.AI_API_KEY!);
  cachedProviders = { billing, mail };
  return cachedProviders;
}

export function resetProviders(): void { cachedProviders = null; }
