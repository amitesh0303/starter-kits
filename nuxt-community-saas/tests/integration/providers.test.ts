import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviders, resetProviders } from "@/server/utils/providers";
import { FakeBillingAdapter } from "@/server/utils/billing-fake";

describe("Provider Selection", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; resetProviders(); });
  afterEach(() => { process.env = originalEnv; resetProviders(); });

  it("returns fake billing by default", () => { expect(getProviders().billing).toBeInstanceOf(FakeBillingAdapter); });
  it("caches", () => { expect(getProviders()).toBe(getProviders()); });
});
