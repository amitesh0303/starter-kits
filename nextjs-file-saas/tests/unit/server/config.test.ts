import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAllRequiredVars() {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test_val_0";
    process.env.CLERK_SECRET_KEY = "test_val_1";
    process.env.DATABASE_URL = "test_val_2";
    process.env.STRIPE_SECRET_KEY = "test_val_3";
    process.env.STRIPE_WEBHOOK_SECRET = "test_val_4";
    process.env.R2_ACCESS_KEY_ID = "test_val_5";
    process.env.R2_SECRET_ACCESS_KEY = "test_val_6";
    process.env.R2_BUCKET_NAME = "test_val_7";
    process.env.INNGEST_SIGNING_KEY = "test_val_8";
  }

  it("returns config when all required vars are set", () => {
    setAllRequiredVars();
    const config = validateConfig();
    expect(config.clerkPublishableKey).toBe("test_val_0");
  });

  it("throws when required vars are missing", () => {
    expect(() => validateConfig()).toThrow("Missing required environment variables");
  });

  it("detects placeholder values", () => {
    setAllRequiredVars();
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "placeholder";
    expect(() => validateConfig()).toThrow("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  });

  describe("isPlaceholderValue", () => {
    it("detects undefined", () => { expect(isPlaceholderValue(undefined)).toBe(true); });
    it("detects empty string", () => { expect(isPlaceholderValue("")).toBe(true); });
    it("detects placeholder substring", () => { expect(isPlaceholderValue("key_placeholder")).toBe(true); });
    it("does not flag real values", () => { expect(isPlaceholderValue("sk_real_key_123")).toBe(false); });
  });
});
