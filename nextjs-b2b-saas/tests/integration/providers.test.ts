/**
 * Integration tests for provider selection logic.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviders, resetProviders } from "@/lib/server/providers";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { FakeMailAdapter } from "@/lib/server/mail-fake";

describe("Provider Selection", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetProviders();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetProviders();
  });

  it("returns fake billing adapter when PADDLE_API_KEY is placeholder", () => {
    process.env.PADDLE_API_KEY = "placeholder";
    const { billing } = getProviders();
    expect(billing).toBeInstanceOf(FakeBillingAdapter);
  });

  it("returns fake mail adapter when POSTMARK_API_KEY is placeholder", () => {
    process.env.POSTMARK_API_KEY = "";
    const { mail } = getProviders();
    expect(mail).toBeInstanceOf(FakeMailAdapter);
  });

  it("caches providers across calls", () => {
    const first = getProviders();
    const second = getProviders();
    expect(first).toBe(second);
  });

  it("resetProviders clears cache", () => {
    const first = getProviders();
    resetProviders();
    const second = getProviders();
    expect(first).not.toBe(second);
  });
});
