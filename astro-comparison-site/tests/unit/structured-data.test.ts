import { describe, it, expect } from 'vitest';
import { generateComparisonJsonLd, generateProductJsonLd } from '../../src/seo/structured-data.js';

describe('Comparison JSON-LD', () => {
  const input = {
    title: 'Best Laptops for Developers 2024',
    description: 'Comparing top laptops for software development.',
    authorName: 'Chris Taylor',
    publishedAt: '2024-04-01T00:00:00.000Z',
    canonicalUrl: 'https://example.com/comparisons/best-laptops/',
    products: [
      { name: 'MacBook Pro 14', brand: 'Apple', rating: 4.5, price: '$1,999', url: 'https://example.com/macbook' },
      { name: 'ThinkPad X1', brand: 'Lenovo', rating: 4.3, price: '$1,499', url: 'https://example.com/thinkpad' },
    ],
  };

  it('contains @context schema.org', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json['@context']).toBe('https://schema.org');
  });

  it('contains @type ItemList', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json['@type']).toBe('ItemList');
  });

  it('contains correct number of items', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json.numberOfItems).toBe(2);
    expect(json.itemListElement).toHaveLength(2);
  });

  it('each item is a ListItem with position', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json.itemListElement[0]['@type']).toBe('ListItem');
    expect(json.itemListElement[0].position).toBe(1);
    expect(json.itemListElement[1].position).toBe(2);
  });

  it('each item contains a Product', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json.itemListElement[0].item['@type']).toBe('Product');
    expect(json.itemListElement[0].item.name).toBe('MacBook Pro 14');
  });

  it('includes brand when provided', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json.itemListElement[0].item.brand.name).toBe('Apple');
  });

  it('includes review rating for each product', () => {
    const json = JSON.parse(generateComparisonJsonLd(input));
    expect(json.itemListElement[0].item.review.reviewRating.ratingValue).toBe(4.5);
  });

  it('produces valid JSON', () => {
    expect(() => JSON.parse(generateComparisonJsonLd(input))).not.toThrow();
  });
});

describe('Product JSON-LD', () => {
  it('generates valid product structured data', () => {
    const json = JSON.parse(generateProductJsonLd({
      name: 'Test Product',
      description: 'A test product',
      brand: 'TestBrand',
      url: 'https://example.com/product',
      ratingValue: 4.0,
    }));
    expect(json['@type']).toBe('Product');
    expect(json.brand.name).toBe('TestBrand');
  });

  it('omits brand when not provided', () => {
    const json = JSON.parse(generateProductJsonLd({
      name: 'Test',
      description: 'Test',
      url: 'https://example.com',
    }));
    expect(json.brand).toBeUndefined();
  });
});
