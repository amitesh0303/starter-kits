import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "$lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAll() {
    process.env.PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.PUBLIC_SUPABASE_ANON_KEY = "anon_key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service_key";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    process.env.AI_API_KEY = "sk-ai-123";
    process.env.AI_MODEL_ID = "gpt-4";
  }

  it("returns config when all vars set", () => { setAll(); const c = validateConfig(); expect(c.supabaseUrl).toBe("https://test.supabase.co"); });
  it("throws when vars missing", () => { expect(() => validateConfig()).toThrow("Missing required"); });
  it("isPlaceholderValue detects empty", () => { expect(isPlaceholderValue("")).toBe(true); });
  it("isPlaceholderValue passes real", () => { expect(isPlaceholderValue("sk_real")).toBe(false); });
});
