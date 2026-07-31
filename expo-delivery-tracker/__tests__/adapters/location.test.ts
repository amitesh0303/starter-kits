import { createFakeLocationAdapter } from "@/adapters/location-adapter";
describe("Location adapter (fake)", () => {
  it("gets current location", async () => { const a = createFakeLocationAdapter(); const loc = await a.getCurrentLocation(); expect(loc.lat).toBeDefined(); expect(loc.lng).toBeDefined(); });
  it("starts and stops tracking", () => { const a = createFakeLocationAdapter(); const stop = a.startTracking(() => {}); expect(typeof stop).toBe("function"); stop(); });
});
