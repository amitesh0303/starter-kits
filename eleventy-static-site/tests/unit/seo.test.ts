import { describe, it, expect } from "vitest";

// Test the SEO data helper
const seo = require("../../src/data/seo.js");

describe("SEO - Article JSON-LD", () => {
  const post = {
    title: "Getting Started with Eleventy",
    description: "Learn how to set up Eleventy.",
    date: "2024-03-15",
    url: "/posts/getting-started/",
  };

  it("generates valid JSON-LD", () => {
    const result = seo.generateArticleJsonLd(post, "https://example.com");
    const json = JSON.parse(result);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("Article");
  });

  it("includes headline", () => {
    const result = seo.generateArticleJsonLd(post, "https://example.com");
    const json = JSON.parse(result);
    expect(json.headline).toBe("Getting Started with Eleventy");
  });

  it("includes canonical URL", () => {
    const result = seo.generateArticleJsonLd(post, "https://example.com");
    const json = JSON.parse(result);
    expect(json.mainEntityOfPage["@id"]).toBe("https://example.com/posts/getting-started/");
  });
});

describe("SEO - Breadcrumb JSON-LD", () => {
  it("generates breadcrumb list", () => {
    const items = [
      { name: "Home", url: "/" },
      { name: "Posts", url: "/posts/" },
    ];
    const result = seo.generateBreadcrumbJsonLd(items, "https://example.com");
    const json = JSON.parse(result);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(2);
    expect(json.itemListElement[0].position).toBe(1);
  });
});
