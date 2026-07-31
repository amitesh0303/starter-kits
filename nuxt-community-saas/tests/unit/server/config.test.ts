import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateConfig, isPlaceholderValue } from "@/server/utils/config";

describe("Config Validation", () => {
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  function setAll() {
    process.env.DATABASE_URL = "postgresql://localhost/test";
    process.env.BETTER_AUTH_SECRET = "secret_123";
    process.env.PADDLE_API_KEY = "pdl_123";
    process.env.PADDLE_WEBHOOK_SECRET = "whsec_123";
    process.env.NUXT_PUBLIC_APP_URL = "http://localhost:3000";
  }

  it("returns config", () => { setAll(); expect(validateConfig().databaseUrl).toBe("postgresql://localhost/test"); });
  it("throws when missing", () => { expect(() => validateConfig()).toThrow("Missing required"); });
  it("isPlaceholderValue works", () => { expect(isPlaceholderValue("")).toBe(true); expect(isPlaceholderValue("real")).toBe(false); });
});
