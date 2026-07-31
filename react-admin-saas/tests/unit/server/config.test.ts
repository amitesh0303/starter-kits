import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAllRequiredVars() {
    process.env.VITE_AUTH0_DOMAIN = "test_val_0";
    process.env.VITE_AUTH0_CLIENT_ID = "test_val_1";
    process.env.VITE_SUPABASE_URL = "test_val_2";
    process.env.VITE_SUPABASE_ANON_KEY = "test_val_3";
    process.env.VITE_STRIPE_PUBLISHABLE_KEY = "test_val_4";
  }

  it("returns config when all required vars are set", () => {
    setAllRequiredVars();
    const config = validateConfig();
    expect(config.auth0Domain).toBe("test_val_0");
  });

  it("throws when required vars are missing", () => {
    expect(() => validateConfig()).toThrow("Missing required environment variables");
  });

  describe("isPlaceholderValue", () => {
    it("detects undefined", () => { expect(isPlaceholderValue(undefined)).toBe(true); });
    it("detects empty string", () => { expect(isPlaceholderValue("")).toBe(true); });
    it("does not flag real values", () => { expect(isPlaceholderValue("sk_real_key")).toBe(false); });
  });
});
