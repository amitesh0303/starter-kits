import { describe, it, expect } from 'vitest';
import { generateArticleJsonLd, type ArticleJsonLdInput } from '../../src/seo/structured-data.js';

function makeInput(overrides: Partial<ArticleJsonLdInput> = {}): ArticleJsonLdInput {
  return {
    title: 'Getting Started with Astro Framework',
    description: 'Learn how to build fast static sites with Astro, the modern web framework.',
    publishedAt: '2024-01-15T00:00:00.000Z',
    authorName: 'Jane Doe',
    canonicalUrl: 'https://example.com/articles/getting-started-with-astro/',
    ...overrides,
  };
}

describe('Structured Data - Article JSON-LD', () => {
  it('contains required @context field', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json['@context']).toBe('https://schema.org');
  });

  it('contains required @type field set to Article', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json['@type']).toBe('Article');
  });

  it('contains required headline field', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.headline).toBe('Getting Started with Astro Framework');
  });

  it('contains required datePublished field', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.datePublished).toBe('2024-01-15T00:00:00.000Z');
  });

  it('contains required dateModified field', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.dateModified).toBeDefined();
  });

  it('uses updatedAt as dateModified when provided', () => {
    const input = makeInput({ updatedAt: '2024-06-01T00:00:00.000Z' });
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.dateModified).toBe('2024-06-01T00:00:00.000Z');
  });

  it('falls back to publishedAt for dateModified when updatedAt absent', () => {
    const input = makeInput({ updatedAt: undefined });
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.dateModified).toBe(input.publishedAt);
  });

  it('contains required author field as Person', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.author).toEqual({
      '@type': 'Person',
      name: 'Jane Doe',
    });
  });

  it('contains required publisher field as Organization', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.publisher).toEqual({
      '@type': 'Organization',
      name: 'Astro AdSense Blog',
    });
  });

  it('contains required mainEntityOfPage field', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.mainEntityOfPage).toEqual({
      '@type': 'WebPage',
      '@id': 'https://example.com/articles/getting-started-with-astro/',
    });
  });

  it('includes image when provided', () => {
    const input = makeInput({ image: 'https://example.com/image.jpg' });
    const json = JSON.parse(generateArticleJsonLd(input));
    expect(json.image).toBe('https://example.com/image.jpg');
  });

  it('omits image when not provided', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    expect(json.image).toBeUndefined();
  });

  it('produces valid JSON string output', () => {
    const output = generateArticleJsonLd(makeInput());
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('has all required schema.org Article fields', () => {
    const json = JSON.parse(generateArticleJsonLd(makeInput()));
    const requiredFields = [
      '@context',
      '@type',
      'headline',
      'datePublished',
      'dateModified',
      'author',
      'publisher',
      'mainEntityOfPage',
    ];
    for (const field of requiredFields) {
      expect(json).toHaveProperty(field);
    }
  });
});
