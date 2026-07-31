import { createFakeHealthAdapter } from "@/adapters/health-adapter";
describe("Health adapter (fake)", () => {
  it("returns steps", async () => { const a = createFakeHealthAdapter(); expect(await a.getSteps("2025-01-01")).toBeGreaterThan(0); });
  it("returns heart rate", async () => { const a = createFakeHealthAdapter(); expect(await a.getHeartRate()).toBeGreaterThan(0); });
  it("reports availability", async () => { const a = createFakeHealthAdapter(); expect(await a.isAvailable()).toBe(true); });
});
