import { describe, it, expect } from "vitest";
import { generateLandingPageJsonLd, generateBreadcrumbJsonLd } from "@/lib/server/seo";

describe("SEO - Landing Page JSON-LD", () => {
  const page = {
    id: "1",
    slug: "best-web-development-san-francisco",
    title: "Best Web Development in San Francisco",
    description: "Find top-rated web development services.",
    content: "Content here",
    template: "city-service",
    keywords: ["web development", "san francisco"],
    location: "San Francisco, CA",
    category: "web-development",
    publishedAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-03-01"),
    status: "published" as const,
  };

  it("generates valid JSON-LD", () => {
    const result = generateLandingPageJsonLd(page, "https://example.com/best-web-development-san-francisco");
    const json = JSON.parse(result);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("WebPage");
  });

  it("includes keywords", () => {
    const result = generateLandingPageJsonLd(page, "https://example.com/test");
    const json = JSON.parse(result);
    expect(json.keywords).toContain("web development");
  });
});

describe("SEO - Breadcrumb JSON-LD", () => {
  it("generates breadcrumb list", () => {
    const result = generateBreadcrumbJsonLd([
      { name: "Home", url: "https://example.com/" },
      { name: "San Francisco", url: "https://example.com/san-francisco" },
    ]);
    const json = JSON.parse(result);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(2);
  });
});
