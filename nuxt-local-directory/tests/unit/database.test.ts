import { describe, it, expect } from "vitest";
import { useDatabase } from "../../composables/useDatabase";

describe("Database Adapter", () => {
  const db = useDatabase();

  it("returns businesses with pagination", async () => {
    const result = await db.getBusinesses(1, 10);
    expect(result.businesses).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns business by id", async () => {
    const business = await db.getBusinessById("1");
    expect(business).not.toBeNull();
    expect(business!.name).toBe("Joe's Coffee Shop");
  });

  it("returns null for unknown id", async () => {
    const business = await db.getBusinessById("nonexistent");
    expect(business).toBeNull();
  });

  it("returns categories", async () => {
    const categories = await db.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0].slug).toBeDefined();
  });

  it("returns category by slug", async () => {
    const category = await db.getCategoryBySlug("food-drink");
    expect(category).not.toBeNull();
    expect(category!.name).toBe("Food & Drink");
  });
});
