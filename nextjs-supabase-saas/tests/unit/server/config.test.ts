/**
 * Unit tests for typed aggregate config validation.
 * Tests: missing required vars, placeholder detection, optional fallback.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/lib/server/config";

describe("Config Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function setAllRequiredVars() {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.STRIPE_SECRET_KEY = "sk_test_abc123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_abc123";
    process.env.STRIPE_PRICE_ID = "price_test_abc123";
    process.env.RESEND_API_KEY = "re_test_abc123";
  }

  describe("validateConfig", () => {
    it("returns config when all required vars are set", () => {
      setAllRequiredVars();
      const config = validateConfig();
      expect(config.supabaseUrl).toBe("https://test.supabase.co");
      expect(config.stripeSecretKey).toBe("sk_test_abc123");
    });

    it("throws with all missing required var names listed when none are set", () => {
      // Clear all env vars
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_PRICE_ID;
      delete process.env.RESEND_API_KEY;

      expect(() => validateConfig()).toThrow("Missing required environment variables");
      try {
        validateConfig();
      } catch (e) {
        const msg = (e as Error).message;
        expect(msg).toContain("NEXT_PUBLIC_SUPABASE_URL");
        expect(msg).toContain("STRIPE_SECRET_KEY");
        expect(msg).toContain("STRIPE_WEBHOOK_SECRET");
        expect(msg).toContain("RESEND_API_KEY");
      }
    });

    it("throws when some required vars are missing", () => {
      setAllRequiredVars();
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() => validateConfig()).toThrow("Missing required environment variables");
      try {
        validateConfig();
      } catch (e) {
        const msg = (e as Error).message;
        expect(msg).toContain("STRIPE_SECRET_KEY");
        expect(msg).toContain("STRIPE_WEBHOOK_SECRET");
        // Should not contain vars that ARE set
        expect(msg).not.toContain("NEXT_PUBLIC_SUPABASE_URL");
      }
    });

    it("detects placeholder values as missing", () => {
      setAllRequiredVars();
      process.env.STRIPE_SECRET_KEY = "placeholder";

      expect(() => validateConfig()).toThrow("STRIPE_SECRET_KEY");
    });

    it("detects empty string as missing", () => {
      setAllRequiredVars();
      process.env.STRIPE_SECRET_KEY = "";

      expect(() => validateConfig()).toThrow("STRIPE_SECRET_KEY");
    });
  });

  describe("isPlaceholderValue", () => {
    it("detects undefined as placeholder", () => {
      expect(isPlaceholderValue(undefined)).toBe(true);
    });

    it("detects empty string as placeholder", () => {
      expect(isPlaceholderValue("")).toBe(true);
    });

    it("detects 'placeholder' as placeholder", () => {
      expect(isPlaceholderValue("placeholder")).toBe(true);
    });

    it("detects 'CHANGE_ME' as placeholder", () => {
      expect(isPlaceholderValue("CHANGE_ME")).toBe(true);
    });

    it("detects 'xxx' as placeholder", () => {
      expect(isPlaceholderValue("xxx")).toBe(true);
    });

    it("does not flag real values as placeholder", () => {
      expect(isPlaceholderValue("sk_test_real_key_123")).toBe(false);
    });

    it("detects .env.example values containing 'placeholder' substring", () => {
      expect(isPlaceholderValue("sk_test_placeholder")).toBe(true);
      expect(isPlaceholderValue("whsec_placeholder")).toBe(true);
      expect(isPlaceholderValue("re_placeholder")).toBe(true);
      expect(isPlaceholderValue("price_placeholder")).toBe(true);
    });
  });
});
