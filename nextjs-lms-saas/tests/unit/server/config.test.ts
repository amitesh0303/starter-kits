import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAllRequiredVars() {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_123";
    process.env.CLERK_SECRET_KEY = "sk_test_123";
    process.env.DATABASE_URL = "postgresql://localhost/test";
    process.env.STRIPE_SECRET_KEY = "sk_stripe_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    process.env.MUX_TOKEN_ID = "mux_id_123";
    process.env.MUX_TOKEN_SECRET = "mux_sec_123";
    process.env.UPLOADTHING_SECRET = "ut_sec_123";
  }

  it("returns config when all required vars are set", () => {
    setAllRequiredVars();
    const config = validateConfig();
    expect(config.clerkPublishableKey).toBe("pk_test_123");
  });

  it("throws when required vars are missing", () => {
    expect(() => validateConfig()).toThrow("Missing required environment variables");
  });

  it("detects placeholder values", () => {
    setAllRequiredVars();
    process.env.STRIPE_SECRET_KEY = "placeholder";
    expect(() => validateConfig()).toThrow("STRIPE_SECRET_KEY");
  });

  describe("isPlaceholderValue", () => {
    it("detects undefined", () => { expect(isPlaceholderValue(undefined)).toBe(true); });
    it("detects empty string", () => { expect(isPlaceholderValue("")).toBe(true); });
    it("detects placeholder substring", () => { expect(isPlaceholderValue("key_placeholder")).toBe(true); });
    it("does not flag real values", () => { expect(isPlaceholderValue("sk_real_key_123")).toBe(false); });
  });
});
