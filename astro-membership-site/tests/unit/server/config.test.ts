import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAll() {
    process.env.PUBLIC_CLERK_PUBLISHABLE_KEY = "test_val_0";
    process.env.CLERK_SECRET_KEY = "test_val_1";
    process.env.TURSO_DB_URL = "test_val_2";
    process.env.TURSO_AUTH_TOKEN = "test_val_3";
    process.env.STRIPE_SECRET_KEY = "test_val_4";
    process.env.STRIPE_WEBHOOK_SECRET = "test_val_5";
    process.env.RESEND_API_KEY = "test_val_6";
  }

  it("returns config", () => { setAll(); expect(validateConfig().clerkPublishableKey).toBe("test_val_0"); });
  it("throws when missing", () => { expect(() => validateConfig()).toThrow("Missing required"); });
  it("placeholder detection", () => { expect(isPlaceholderValue("")).toBe(true); expect(isPlaceholderValue("real")).toBe(false); });
});
