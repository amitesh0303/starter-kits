import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviders, resetProviders } from "@/lib/server/providers";
import { FakeBillingAdapter } from "@/lib/server/billing-fake";
import { FakeMailAdapter } from "@/lib/server/mail-fake";

describe("Provider Selection", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; resetProviders(); });
  afterEach(() => { process.env = originalEnv; resetProviders(); });

  it("returns fake billing when env is placeholder", () => {
    process.env.STRIPE_SECRET_KEY = "placeholder";
    const { billing } = getProviders();
    expect(billing).toBeInstanceOf(FakeBillingAdapter);
  });

  it("returns fake mail when env is placeholder", () => {
    process.env.MUX_TOKEN_SECRET = "";
    const { mail } = getProviders();
    expect(mail).toBeInstanceOf(FakeMailAdapter);
  });

  it("caches providers", () => {
    const first = getProviders();
    expect(first).toBe(getProviders());
  });

  it("resetProviders clears cache", () => {
    const first = getProviders();
    resetProviders();
    expect(first).not.toBe(getProviders());
  });
});
