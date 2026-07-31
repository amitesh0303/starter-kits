import { describe, it, expect } from "vitest";
import { createDatabaseAdapter } from "@/lib/server/database";

describe("Database Adapter", () => {
  const db = createDatabaseAdapter();

  it("returns properties with pagination", async () => {
    const result = await db.getProperties(1, 10);
    expect(result.properties).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns property by id", async () => {
    const property = await db.getPropertyById("1");
    expect(property).not.toBeNull();
    expect(property!.title).toBe("Modern Downtown Apartment");
  });

  it("returns null for unknown id", async () => {
    const property = await db.getPropertyById("nonexistent");
    expect(property).toBeNull();
  });

  it("returns agents", async () => {
    const agents = await db.getAgents();
    expect(agents.length).toBeGreaterThan(0);
    expect(agents[0].name).toBe("Sarah Johnson");
  });

  it("returns properties by type", async () => {
    const result = await db.getPropertiesByType("sale", 1, 10);
    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.properties[0].type).toBe("sale");
  });

  it("filters rent properties", async () => {
    const result = await db.getPropertiesByType("rent", 1, 10);
    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.properties[0].type).toBe("rent");
  });
});
