import { describe, it, expect } from "vitest";
import { createDatabaseAdapter } from "@/lib/server/database";

describe("Database Adapter", () => {
  const db = createDatabaseAdapter();

  it("returns listings with pagination", async () => {
    const result = await db.getListings(1, 10);
    expect(result.listings).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns listing by id", async () => {
    const listing = await db.getListingById("1");
    expect(listing).not.toBeNull();
    expect(listing!.name).toBe("Acme Web Design");
  });

  it("returns null for unknown id", async () => {
    const listing = await db.getListingById("nonexistent");
    expect(listing).toBeNull();
  });

  it("returns categories", async () => {
    const categories = await db.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].slug).toBeDefined();
  });

  it("returns category by slug", async () => {
    const category = await db.getCategoryBySlug("web-development");
    expect(category).not.toBeNull();
    expect(category!.name).toBe("Web Development");
  });

  it("returns listings by category", async () => {
    const result = await db.getListingsByCategory("web-development", 1, 10);
    expect(result.listings.length).toBeGreaterThan(0);
    expect(result.listings[0].category).toBe("web-development");
  });
});
