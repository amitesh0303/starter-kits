import { describe, it, expect } from "vitest";
import { generateLocalBusinessJsonLd, generateDirectoryBreadcrumbJsonLd } from "@/lib/server/seo";

describe("SEO - LocalBusiness JSON-LD", () => {
  const listing = {
    id: "1",
    name: "Test Business",
    description: "A test business",
    category: "test",
    location: "Test City",
    website: "https://test.example.com",
    phone: "+1-555-0100",
    rating: 4.5,
    reviewCount: 10,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("generates valid JSON-LD", () => {
    const result = generateLocalBusinessJsonLd({
      listing,
      canonicalUrl: "https://example.com/listings/1",
    });
    const json = JSON.parse(result);
    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("LocalBusiness");
  });

  it("includes aggregate rating", () => {
    const result = generateLocalBusinessJsonLd({
      listing,
      canonicalUrl: "https://example.com/listings/1",
    });
    const json = JSON.parse(result);
    expect(json.aggregateRating.ratingValue).toBe(4.5);
    expect(json.aggregateRating.reviewCount).toBe(10);
  });
});

describe("SEO - Breadcrumb JSON-LD", () => {
  it("generates breadcrumb list", () => {
    const result = generateDirectoryBreadcrumbJsonLd([
      { name: "Home", url: "https://example.com/" },
      { name: "Category", url: "https://example.com/categories/test" },
    ]);
    const json = JSON.parse(result);
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(2);
    expect(json.itemListElement[0].position).toBe(1);
  });
});
