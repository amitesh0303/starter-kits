import { createFakeChatAdapter } from "@/adapters/chat-adapter";
describe("Chat adapter (fake)", () => {
  it("connects without error", async () => { const a = createFakeChatAdapter(); await expect(a.connect("u1")).resolves.not.toThrow(); });
  it("sends message", async () => { const a = createFakeChatAdapter(); const r = await a.sendMessage("ch1", "hi"); expect(r.id).toBeDefined(); });
  it("disconnects", async () => { const a = createFakeChatAdapter(); await expect(a.disconnect()).resolves.not.toThrow(); });
});
