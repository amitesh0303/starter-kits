import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviders, resetProviders } from "$lib/server/providers";
import { FakeBillingAdapter } from "$lib/server/billing-fake";

describe("Provider Selection", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; resetProviders(); });
  afterEach(() => { process.env = originalEnv; resetProviders(); });

  it("returns fake billing by default", () => { expect(getProviders().billing).toBeInstanceOf(FakeBillingAdapter); });
  it("caches providers", () => { expect(getProviders()).toBe(getProviders()); });
  it("reset clears cache", () => { const f = getProviders(); resetProviders(); expect(f).not.toBe(getProviders()); });
});
