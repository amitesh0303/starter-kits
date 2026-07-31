/**
 * Provider selection: Chooses real vs fake adapters based on config state.
 * When env vars are placeholder values, fake adapters are used.
 * This ensures the app can run in development/test without real credentials.
 */

import { isPlaceholderValue } from "./config";
import { FakeBillingAdapter } from "./billing-fake";
import { FakeVideoAdapter } from "./video-fake";
import { FakeUploadAdapter } from "./upload-fake";
import { StripeBillingAdapter } from "./billing";
import type { BillingPort } from "./billing";
import { MuxVideoAdapter } from "./video";
import type { VideoPort } from "./video";
import { UploadThingAdapter } from "./upload";
import type { UploadPort } from "./upload";

export interface Providers {
  billing: BillingPort;
  video: VideoPort;
  upload: UploadPort;
}

let cachedProviders: Providers | null = null;

/**
 * Returns the configured providers, selecting fakes when credentials are placeholder values.
 * Providers are cached for the lifetime of the process.
 */
export function getProviders(): Providers {
  if (cachedProviders) return cachedProviders;

  const billing = createBillingProvider();
  const video = createVideoProvider();
  const upload = createUploadProvider();

  cachedProviders = { billing, video, upload };
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

function createVideoProvider(): VideoPort {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;

  if (isPlaceholderValue(tokenId) || isPlaceholderValue(tokenSecret)) {
    return new FakeVideoAdapter();
  }

  return new MuxVideoAdapter(tokenId!, tokenSecret!);
}

function createUploadProvider(): UploadPort {
  const token = process.env.UPLOADTHING_TOKEN;

  if (isPlaceholderValue(token)) {
    return new FakeUploadAdapter();
  }

  return new UploadThingAdapter(token!);
}
