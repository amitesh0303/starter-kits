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
      expect(isPlaceholderValue("pdl_live_abc123")).toBe(false);
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
        expect(msg).toContain("AUTH0_SECRET");
        expect(msg).toContain("AUTH0_BASE_URL");
        expect(msg).toContain("AUTH0_ISSUER_BASE_URL");
        expect(msg).toContain("AUTH0_CLIENT_ID");
        expect(msg).toContain("AUTH0_CLIENT_SECRET");
        expect(msg).toContain("DATABASE_URL");
        expect(msg).toContain("PADDLE_API_KEY");
        expect(msg).toContain("PADDLE_WEBHOOK_SECRET");
        expect(msg).toContain("POSTMARK_API_KEY");
      }
    });

    it("succeeds when all vars are set to real values", () => {
      process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
      process.env.AUTH0_SECRET = "real_secret_value";
      process.env.AUTH0_BASE_URL = "http://localhost:3000";
      process.env.AUTH0_ISSUER_BASE_URL = "https://my-tenant.auth0.com";
      process.env.AUTH0_CLIENT_ID = "real_client_id";
      process.env.AUTH0_CLIENT_SECRET = "real_client_secret";
      process.env.DATABASE_URL = "postgres://real-connection";
      process.env.PADDLE_API_KEY = "pdl_real_key";
      process.env.PADDLE_WEBHOOK_SECRET = "pdl_whsec_real";
      process.env.POSTMARK_API_KEY = "pm_real_key";

      const config = validateConfig();
      expect(config.auth0Secret).toBe("real_secret_value");
      expect(config.databaseUrl).toBe("postgres://real-connection");
    });
  });

  describe("getRawConfig", () => {
    it("returns empty object when all placeholder", () => {
      const config = getRawConfig();
      expect(Object.keys(config)).toHaveLength(0);
    });

    it("returns only non-placeholder values", () => {
      process.env.PADDLE_API_KEY = "pdl_real_key";
      const config = getRawConfig();
      expect(config.paddleApiKey).toBe("pdl_real_key");
    });
  });

  describe("getServerOnlyKeys", () => {
    it("returns server-only env keys", () => {
      const keys = getServerOnlyKeys();
      expect(keys).toContain("AUTH0_SECRET");
      expect(keys).toContain("AUTH0_CLIENT_SECRET");
      expect(keys).toContain("DATABASE_URL");
      expect(keys).toContain("PADDLE_API_KEY");
      expect(keys).toContain("PADDLE_WEBHOOK_SECRET");
      expect(keys).toContain("POSTMARK_API_KEY");
      expect(keys).not.toContain("NEXT_PUBLIC_APP_URL");
    });
  });

  describe("getPublicKeys", () => {
    it("returns public env keys", () => {
      const keys = getPublicKeys();
      expect(keys).toContain("NEXT_PUBLIC_APP_URL");
      expect(keys).not.toContain("AUTH0_SECRET");
    });
  });
});
