import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAll() {
    process.env.SESSION_SECRET = "test_val_0";
    process.env.SHOPIFY_ACCESS_TOKEN = "test_val_1";
    process.env.SHOPIFY_STORE_DOMAIN = "test_val_2";
    process.env.STRIPE_SECRET_KEY = "test_val_3";
    process.env.STRIPE_WEBHOOK_SECRET = "test_val_4";
  }

  it("returns config", () => { setAll(); expect(validateConfig().sessionSecret).toBe("test_val_0"); });
  it("throws when missing", () => { expect(() => validateConfig()).toThrow("Missing required"); });
  it("placeholder detection", () => { expect(isPlaceholderValue("")).toBe(true); expect(isPlaceholderValue("real")).toBe(false); });
});
