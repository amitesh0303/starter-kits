import { describe, it, expect } from 'vitest';
import { generateReviewJsonLd, generateProductJsonLd } from '../../src/seo/structured-data.js';

describe('Review JSON-LD', () => {
  const input = {
    name: 'Best Wireless Headphones Review',
    description: 'A comprehensive review of the top wireless headphones.',
    ratingValue: 4.5,
    authorName: 'Alex Johnson',
    publishedAt: '2024-03-15T00:00:00.000Z',
    canonicalUrl: 'https://example.com/reviews/headphones/',
    productName: 'ProSound Elite ANC',
    productBrand: 'ProSound',
  };

  it('contains required @context field', () => {
    const json = JSON.parse(generateReviewJsonLd(input));
    expect(json['@context']).toBe('https://schema.org');
  });

  it('contains required @type field set to Review', () => {
    const json = JSON.parse(generateReviewJsonLd(input));
    expect(json['@type']).toBe('Review');
  });

  it('contains review rating', () => {
    const json = JSON.parse(generateReviewJsonLd(input));
    expect(json.reviewRating.ratingValue).toBe(4.5);
    expect(json.reviewRating.bestRating).toBe(5);
  });

  it('contains item reviewed as Product', () => {
    const json = JSON.parse(generateReviewJsonLd(input));
    expect(json.itemReviewed['@type']).toBe('Product');
    expect(json.itemReviewed.name).toBe('ProSound Elite ANC');
  });

  it('includes brand when provided', () => {
    const json = JSON.parse(generateReviewJsonLd(input));
    expect(json.itemReviewed.brand.name).toBe('ProSound');
  });

  it('produces valid JSON string output', () => {
    const output = generateReviewJsonLd(input);
    expect(() => JSON.parse(output)).not.toThrow();
  });
});

describe('Product JSON-LD', () => {
  const input = {
    name: 'ProSound Elite ANC',
    description: 'Premium wireless headphones with ANC',
    brand: 'ProSound',
    url: 'https://example.com/reviews/headphones/',
    ratingValue: 4.5,
    reviewCount: 10,
  };

  it('contains required @context and @type', () => {
    const json = JSON.parse(generateProductJsonLd(input));
    expect(json['@context']).toBe('https://schema.org');
    expect(json['@type']).toBe('Product');
  });

  it('includes aggregate rating when provided', () => {
    const json = JSON.parse(generateProductJsonLd(input));
    expect(json.aggregateRating.ratingValue).toBe(4.5);
    expect(json.aggregateRating.reviewCount).toBe(10);
  });

  it('omits aggregate rating when not provided', () => {
    const json = JSON.parse(generateProductJsonLd({ name: 'Test', description: 'Test', url: 'https://example.com' }));
    expect(json.aggregateRating).toBeUndefined();
  });
});
