import { describe, it, expect } from "vitest";
import { generateArticleJsonLd } from "../../composables/useSeo";

describe("SEO - Article JSON-LD", () => {
  const input = {
    title: "How AI is Transforming Healthcare",
    description: "An in-depth look at AI in healthcare.",
    author: "Dr. Sarah Mitchell",
    publishedAt: "2024-03-15",
    canonicalUrl: "https://example.com/articles/ai-healthcare",
    image: "/images/ai-healthcare.jpg",
  };

  it("contains required @context field", () => {
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json["@context"]).toBe("https://schema.org");
  });

  it("uses NewsArticle type", () => {
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json["@type"]).toBe("NewsArticle");
  });

  it("contains headline", () => {
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.headline).toBe("How AI is Transforming Healthcare");
  });

  it("contains author", () => {
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.author.name).toBe("Dr. Sarah Mitchell");
  });

  it("includes image when provided", () => {
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.image).toBe("/images/ai-healthcare.jpg");
  });

  it("omits image when not provided", () => {
    const noImage = { ...input, image: undefined };
    const json = JSON.parse(generateArticleJsonLd(noImage));
    expect(json.image).toBeUndefined();
  });

  it("produces valid JSON", () => {
    expect(() => JSON.parse(generateArticleJsonLd(input))).not.toThrow();
  });
});
