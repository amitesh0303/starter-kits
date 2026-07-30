import { createFakeErrorReporter, redactPII } from "@/adapters/error-reporter";

describe("Error reporter", () => {
  describe("PII redaction", () => {
    it("redacts token fields", () => {
      const context = { userId: "user-1", accessToken: "secret-123" };
      const redacted = redactPII(context);
      expect(redacted.userId).toBe("user-1");
      expect(redacted.accessToken).toBe("[REDACTED]");
    });

    it("redacts password fields", () => {
      const context = { password: "my-secret-pass", action: "login" };
      const redacted = redactPII(context);
      expect(redacted.password).toBe("[REDACTED]");
      expect(redacted.action).toBe("login");
    });

    it("redacts email fields", () => {
      const context = { email: "user@example.com", screen: "settings" };
      const redacted = redactPII(context);
      expect(redacted.email).toBe("[REDACTED]");
      expect(redacted.screen).toBe("settings");
    });

    it("redacts secret fields", () => {
      const context = { apiSecret: "sk_live_123", userId: "u1" };
      const redacted = redactPII(context);
      expect(redacted.apiSecret).toBe("[REDACTED]");
    });

    it("truncates long values", () => {
      const longValue = "x".repeat(250);
      const context = { description: longValue };
      const redacted = redactPII(context);
      expect(redacted.description).toBe("[TRUNCATED]");
    });

    it("preserves safe values", () => {
      const context = { userId: "user-1", screen: "home", action: "tap" };
      const redacted = redactPII(context);
      expect(redacted).toEqual(context);
    });
  });

  describe("fake reporter", () => {
    it("captures exceptions without throwing", () => {
      const reporter = createFakeErrorReporter();
      const spy = jest.spyOn(console, "warn").mockImplementation();

      reporter.captureException(new Error("test error"), {
        userId: "u1",
        token: "secret",
      });

      expect(spy).toHaveBeenCalledWith(
        "[FakeErrorReporter] Exception:",
        "test error",
        expect.objectContaining({ userId: "u1", token: "[REDACTED]" })
      );
      spy.mockRestore();
    });

    it("captures messages without throwing", () => {
      const reporter = createFakeErrorReporter();
      const spy = jest.spyOn(console, "warn").mockImplementation();

      reporter.captureMessage("something happened");

      expect(spy).toHaveBeenCalledWith(
        "[FakeErrorReporter] Message:",
        "something happened",
        {}
      );
      spy.mockRestore();
    });

    it("initializes without error", () => {
      const reporter = createFakeErrorReporter();
      expect(() => reporter.initialize(null)).not.toThrow();
    });
  });
});
