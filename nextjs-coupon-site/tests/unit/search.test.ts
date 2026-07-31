import { describe, it, expect } from "vitest";
import { createSearchAdapter } from "@/lib/server/search";

describe("Search Adapter", () => {
  const search = createSearchAdapter();

  it("finds coupons matching query", async () => {
    const result = await search.search("electronics");
    expect(result.coupons.length).toBeGreaterThan(0);
  });

  it("returns empty for non-matching query", async () => {
    const result = await search.search("zzzznonexistent");
    expect(result.coupons).toHaveLength(0);
  });

  it("searches by store name", async () => {
    const result = await search.search("techstore");
    expect(result.coupons.length).toBeGreaterThan(0);
  });
});
