import { describe, it, expect } from 'vitest';
import { buildAffiliateUrl, isValidAffiliateLink } from '../../src/lib/affiliate.js';

describe('buildAffiliateUrl', () => {
  it('adds ref parameter', () => {
    const result = buildAffiliateUrl({ url: 'https://example.com/product', productName: 'Test' });
    expect(result).toContain('ref=comparison-site');
  });

  it('adds tag when provided', () => {
    const result = buildAffiliateUrl({ url: 'https://example.com/product', productName: 'Test', tag: 'abc' });
    expect(result).toContain('tag=abc');
  });
});

describe('isValidAffiliateLink', () => {
  it('returns true for valid link', () => {
    expect(isValidAffiliateLink({ url: 'https://example.com', productName: 'Test' })).toBe(true);
  });

  it('returns false when url is missing', () => {
    expect(isValidAffiliateLink({ productName: 'Test' })).toBe(false);
  });

  it('returns false when productName is missing', () => {
    expect(isValidAffiliateLink({ url: 'https://example.com' })).toBe(false);
  });
});
