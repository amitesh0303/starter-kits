import { createFakeAIAdapter } from "@/adapters/ai-adapter";

describe("AI adapter (fake)", () => {
  it("returns response", async () => {
    const adapter = createFakeAIAdapter();
    const res = await adapter.sendMessage([{ role: "user", content: "Hello" }]);
    expect(res.content.length).toBeGreaterThan(0);
    expect(res.tokensUsed).toBeGreaterThan(0);
  });
  it("streams response", async () => {
    const adapter = createFakeAIAdapter();
    const chunks: string[] = [];
    await adapter.streamMessage([{ role: "user", content: "Hi" }], (c) => chunks.push(c));
    expect(chunks.length).toBeGreaterThan(0);
  });
});
