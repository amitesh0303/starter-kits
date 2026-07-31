import { createFakeSearchAdapter } from "@/adapters/search-adapter";
describe("Search adapter (fake)", () => {
  it("returns results", async () => { const a = createFakeSearchAdapter(); const r = await a.search("bike"); expect(r.length).toBeGreaterThan(0); });
});
