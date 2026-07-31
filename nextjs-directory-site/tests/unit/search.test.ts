import { describe, it, expect } from "vitest";
import { createSearchAdapter } from "@/lib/server/search";

describe("Search Adapter", () => {
  const search = createSearchAdapter();

  it("returns results matching query", async () => {
    const result = await search.search({ query: "web" });
    expect(result.listings.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns empty results for non-matching query", async () => {
    const result = await search.search({ query: "zzzznonexistent" });
    expect(result.listings).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("includes pagination info", async () => {
    const result = await search.search({ query: "web", page: 1, pageSize: 5 });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(5);
  });
});
