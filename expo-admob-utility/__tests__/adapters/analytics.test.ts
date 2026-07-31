import { createFakeAnalyticsAdapter } from "@/adapters/analytics-adapter";

describe("Analytics adapter (fake)", () => {
  it("logs events without error", async () => {
    const adapter = createFakeAnalyticsAdapter();
    await expect(adapter.logEvent({ name: "tool_used", params: { tool: "calc" } })).resolves.not.toThrow();
  });

  it("sets user ID without error", async () => {
    const adapter = createFakeAnalyticsAdapter();
    await expect(adapter.setUserId("user-1")).resolves.not.toThrow();
    await expect(adapter.setUserId(null)).resolves.not.toThrow();
  });
});
