import { describe, it, expect } from "vitest";
import { useNewsletter } from "../../composables/useNewsletter";

describe("Newsletter Adapter", () => {
  const newsletter = useNewsletter();

  it("subscribes with valid email", async () => {
    const result = await newsletter.subscribe("test@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const result = await newsletter.subscribe("invalid-email");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects empty email", async () => {
    const result = await newsletter.subscribe("");
    expect(result.success).toBe(false);
  });
});
