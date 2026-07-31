import { describe, it, expect } from "vitest";
import { useSearch } from "../../composables/useSearch";

describe("Search Adapter", () => {
  const search = useSearch();

  it("finds businesses matching query", async () => {
    const result = await search.search({ query: "coffee" });
    expect(result.businesses.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns empty for non-matching query", async () => {
    const result = await search.search({ query: "zzzznonexistent" });
    expect(result.businesses).toHaveLength(0);
  });

  it("searches across multiple fields", async () => {
    const result = await search.search({ query: "Portland" });
    expect(result.businesses.length).toBeGreaterThan(0);
  });
});
