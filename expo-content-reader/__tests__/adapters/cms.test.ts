import { createFakeCMSAdapter } from "@/adapters/cms-adapter";
describe("CMS adapter (fake Sanity)", () => {
  it("returns articles", async () => { const a = createFakeCMSAdapter(); const r = await a.getArticles(); expect(r.length).toBeGreaterThan(0); });
  it("returns categories", async () => { const a = createFakeCMSAdapter(); const c = await a.getCategories(); expect(c.length).toBeGreaterThan(0); });
  it("finds article by slug", async () => { const a = createFakeCMSAdapter(); const r = await a.getArticleBySlug("getting-started"); expect(r).not.toBeNull(); });
});
