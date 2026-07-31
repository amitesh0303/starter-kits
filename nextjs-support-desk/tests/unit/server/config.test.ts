import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAllRequiredVars() {
    process.env.NEXTAUTH_SECRET = "test_val_0";
    process.env.NEXTAUTH_URL = "test_val_1";
    process.env.DATABASE_URL = "test_val_2";
    process.env.RESEND_API_KEY = "test_val_3";
    process.env.STORAGE_SECRET_KEY = "test_val_4";
    process.env.STORAGE_BUCKET = "test_val_5";
    process.env.STORAGE_ENDPOINT = "test_val_6";
  }

  it("returns config when all required vars are set", () => {
    setAllRequiredVars();
    const config = validateConfig();
    expect(config.nextAuthSecret).toBe("test_val_0");
  });

  it("throws when required vars are missing", () => {
    expect(() => validateConfig()).toThrow("Missing required environment variables");
  });

  it("detects placeholder values", () => {
    setAllRequiredVars();
    process.env.NEXTAUTH_SECRET = "placeholder";
    expect(() => validateConfig()).toThrow("NEXTAUTH_SECRET");
  });

  describe("isPlaceholderValue", () => {
    it("detects undefined", () => { expect(isPlaceholderValue(undefined)).toBe(true); });
    it("detects empty string", () => { expect(isPlaceholderValue("")).toBe(true); });
    it("detects placeholder substring", () => { expect(isPlaceholderValue("key_placeholder")).toBe(true); });
    it("does not flag real values", () => { expect(isPlaceholderValue("sk_real_key_123")).toBe(false); });
  });
});
