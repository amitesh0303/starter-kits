/**
 * Unit tests for config validation.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  validateConfig,
  isPlaceholderValue,
  getRawConfig,
  getServerOnlyKeys,
  getPublicKeys,
} from "@/lib/server/config";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isPlaceholderValue", () => {
    it("returns true for empty string", () => {
      expect(isPlaceholderValue("")).toBe(true);
    });

    it("returns true for undefined", () => {
      expect(isPlaceholderValue(undefined)).toBe(true);
    });

    it("returns true for 'your-value-here'", () => {
      expect(isPlaceholderValue("your-value-here")).toBe(true);
    });

    it("returns true for 'CHANGE_ME'", () => {
      expect(isPlaceholderValue("CHANGE_ME")).toBe(true);
    });

    it("returns true for values containing 'placeholder'", () => {
      expect(isPlaceholderValue("sk_test_placeholder")).toBe(true);
      expect(isPlaceholderValue("whsec_placeholder")).toBe(true);
    });

    it("returns false for real-looking values", () => {
      expect(isPlaceholderValue("sk_live_abc123")).toBe(false);
      expect(isPlaceholderValue("postgres://real-connection")).toBe(false);
    });
  });

  describe("validateConfig", () => {
    it("throws when required vars are missing", () => {
      expect(() => validateConfig()).toThrow("Missing required environment variables");
    });

    it("throws with all missing var names aggregated", () => {
      try {
        validateConfig();
      } catch (error) {
        const msg = (error as Error).message;
        expect(msg).toContain("CLERK_SECRET_KEY");
        expect(msg).toContain("DATABASE_URL");
        expect(msg).toContain("OPENAI_API_KEY");
        expect(msg).toContain("LEMONSQUEEZY_API_KEY");
        expect(msg).toContain("LEMONSQUEEZY_WEBHOOK_SECRET");
      }
    });

    it("succeeds when all vars are set to real values", () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_real";
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
      process.env.CLERK_SECRET_KEY = "sk_test_real";
      process.env.DATABASE_URL = "postgres://real-connection";
      process.env.OPENAI_API_KEY = "sk-real-key";
      process.env.LEMONSQUEEZY_API_KEY = "ls_real_key";
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "whsec_real_secret";

      const config = validateConfig();
      expect(config.clerkSecretKey).toBe("sk_test_real");
      expect(config.databaseUrl).toBe("postgres://real-connection");
    });
  });

  describe("getRawConfig", () => {
    it("returns empty object when all placeholder", () => {
      const config = getRawConfig();
      expect(Object.keys(config)).toHaveLength(0);
    });

    it("returns only non-placeholder values", () => {
      process.env.OPENAI_API_KEY = "sk-real-key";
      const config = getRawConfig();
      expect(config.openaiApiKey).toBe("sk-real-key");
    });
  });

  describe("getServerOnlyKeys", () => {
    it("returns server-only env keys", () => {
      const keys = getServerOnlyKeys();
      expect(keys).toContain("CLERK_SECRET_KEY");
      expect(keys).toContain("DATABASE_URL");
      expect(keys).toContain("OPENAI_API_KEY");
      expect(keys).toContain("LEMONSQUEEZY_API_KEY");
      expect(keys).toContain("LEMONSQUEEZY_WEBHOOK_SECRET");
      expect(keys).not.toContain("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
      expect(keys).not.toContain("NEXT_PUBLIC_APP_URL");
    });
  });

  describe("getPublicKeys", () => {
    it("returns public env keys", () => {
      const keys = getPublicKeys();
      expect(keys).toContain("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
      expect(keys).toContain("NEXT_PUBLIC_APP_URL");
      expect(keys).not.toContain("CLERK_SECRET_KEY");
    });
  });
});
