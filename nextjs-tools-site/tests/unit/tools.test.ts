import { describe, it, expect } from "vitest";
import { tools, categories, getToolBySlug, getToolsByCategory, getCategoryBySlug } from "@/data/tools";

describe("Tools Data", () => {
  it("has at least 3 tools defined", () => {
    expect(tools.length).toBeGreaterThanOrEqual(3);
  });

  it("has at least 2 categories defined", () => {
    expect(categories.length).toBeGreaterThanOrEqual(2);
  });

  it("each tool has required fields", () => {
    for (const tool of tools) {
      expect(tool.id).toBeDefined();
      expect(tool.slug).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.category).toBeDefined();
      expect(tool.keywords.length).toBeGreaterThan(0);
    }
  });

  it("getToolBySlug returns correct tool", () => {
    const tool = getToolBySlug("word-counter");
    expect(tool).not.toBeUndefined();
    expect(tool!.name).toBe("Word Counter");
  });

  it("getToolBySlug returns undefined for unknown slug", () => {
    expect(getToolBySlug("nonexistent")).toBeUndefined();
  });

  it("getToolsByCategory returns tools for given category", () => {
    const textTools = getToolsByCategory("text");
    expect(textTools.length).toBeGreaterThan(0);
    expect(textTools.every((t) => t.category === "text")).toBe(true);
  });

  it("getCategoryBySlug returns correct category", () => {
    const cat = getCategoryBySlug("math");
    expect(cat).not.toBeUndefined();
    expect(cat!.name).toBe("Math Tools");
  });
});
