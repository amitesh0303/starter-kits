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
  const billing: BillingPort = isPlaceholderValue(process.env.PADDLE_API_KEY) ? new FakeBillingAdapter() : new PaddleBillingAdapter(process.env.PADDLE_API_KEY!, process.env.PADDLE_WEBHOOK_SECRET!);
  const mail: MailPort = new FakeMailAdapter();
  cachedProviders = { billing, mail };
  return cachedProviders;
}

export function resetProviders(): void { cachedProviders = null; }
