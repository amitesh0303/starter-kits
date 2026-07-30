/**
 * Unit tests for the fake AI adapter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FakeAIAdapter } from "@/lib/server/ai-fake";

describe("FakeAIAdapter", () => {
  let ai: FakeAIAdapter;

  beforeEach(() => {
    ai = new FakeAIAdapter();
  });

  describe("generateResponse", () => {
    it("returns deterministic response", async () => {
      const result = await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.content).toBe(
        "This is a fake AI response for testing purposes."
      );
      expect(result.promptTokens).toBe(10);
      expect(result.completionTokens).toBe(20);
      expect(result.model).toBe("gpt-4o-mini");
    });

    it("tracks all calls", async () => {
      await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });
      await ai.generateResponse({
        model: "gpt-4",
        messages: [{ role: "user", content: "World" }],
      });

      expect(ai.calls).toHaveLength(2);
      expect(ai.calls[0].model).toBe("gpt-4o-mini");
      expect(ai.calls[1].model).toBe("gpt-4");
    });

    it("tracks generation results", async () => {
      await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(ai.generations).toHaveLength(1);
      expect(ai.generations[0].model).toBe("gpt-4o-mini");
    });

    it("uses custom response content", async () => {
      ai.setResponse("Custom response");
      const result = await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.content).toBe("Custom response");
    });

    it("uses custom token counts", async () => {
      ai.setTokenCounts(50, 100);
      const result = await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.promptTokens).toBe(50);
      expect(result.completionTokens).toBe(100);
    });

    it("throws when configured to fail", async () => {
      ai.setFailure(true, "API rate limit exceeded");
      await expect(
        ai.generateResponse({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Hello" }],
        })
      ).rejects.toThrow("API rate limit exceeded");
    });
  });

  describe("reset", () => {
    it("clears all state", async () => {
      await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });
      ai.setResponse("Modified");
      ai.setTokenCounts(99, 99);

      ai.reset();

      expect(ai.calls).toHaveLength(0);
      expect(ai.generations).toHaveLength(0);

      const result = await ai.generateResponse({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
      });
      expect(result.content).toBe(
        "This is a fake AI response for testing purposes."
      );
      expect(result.promptTokens).toBe(10);
      expect(result.completionTokens).toBe(20);
    });
  });
});
