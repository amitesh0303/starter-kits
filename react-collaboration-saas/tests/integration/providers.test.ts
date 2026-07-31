import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviders, resetProviders } from "@/lib/providers";
import { FakeBillingAdapter } from "@/lib/billing-fake";

describe("Provider Selection", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; resetProviders(); });
  afterEach(() => { process.env = originalEnv; resetProviders(); });

  it("returns fake billing by default", () => {
    const { billing } = getProviders();
    expect(billing).toBeInstanceOf(FakeBillingAdapter);
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
