import { describe, it, expect } from "vitest";
import { createDatabaseAdapter } from "@/lib/server/database";

describe("Database Adapter", () => {
  const db = createDatabaseAdapter();

  it("returns pages with pagination", async () => {
    const result = await db.getPages(1, 10);
    expect(result.pages).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns page by slug", async () => {
    const page = await db.getPageBySlug("best-web-development-san-francisco");
    expect(page).not.toBeNull();
    expect(page!.title).toContain("Web Development");
  });

  it("returns null for unknown slug", async () => {
    const page = await db.getPageBySlug("nonexistent-page");
    expect(page).toBeNull();
  });

  it("returns templates", async () => {
    const templates = await db.getTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0].variableKeys).toContain("service");
  });
});
