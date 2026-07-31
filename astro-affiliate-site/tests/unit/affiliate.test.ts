import { describe, it, expect } from 'vitest';
import { buildAffiliateUrl, isValidAffiliateLink } from '../../src/lib/affiliate.js';

describe('buildAffiliateUrl', () => {
  it('adds ref parameter to URL', () => {
    const result = buildAffiliateUrl({
      url: 'https://merchant.com/product',
      merchant: 'TestMerchant',
      productName: 'Test Product',
    });
    expect(result).toContain('ref=affiliate-site');
  });

  it('adds tag parameter when provided', () => {
    const result = buildAffiliateUrl({
      url: 'https://merchant.com/product',
      merchant: 'TestMerchant',
      productName: 'Test Product',
      tag: 'my-tag-20',
    });
    expect(result).toContain('tag=my-tag-20');
  });

  it('preserves existing URL parameters', () => {
    const result = buildAffiliateUrl({
      url: 'https://merchant.com/product?color=red',
      merchant: 'TestMerchant',
      productName: 'Test Product',
    });
    expect(result).toContain('color=red');
    expect(result).toContain('ref=affiliate-site');
  });
});

describe('isValidAffiliateLink', () => {
  it('returns true for complete link', () => {
    expect(
      isValidAffiliateLink({
        url: 'https://example.com',
        merchant: 'Test',
        productName: 'Product',
      })
    ).toBe(true);
  });

  it('returns false when url is missing', () => {
    expect(isValidAffiliateLink({ merchant: 'Test', productName: 'Product' })).toBe(false);
  });

  it('returns false when merchant is missing', () => {
    expect(isValidAffiliateLink({ url: 'https://example.com', productName: 'Product' })).toBe(false);
  });

  it('returns false when productName is missing', () => {
    expect(isValidAffiliateLink({ url: 'https://example.com', merchant: 'Test' })).toBe(false);
  });
});
