export interface AffiliateLink {
  url: string;
  merchant: string;
  productName: string;
  tag?: string;
}

/**
 * Generates an affiliate URL with proper tracking parameters.
 * In production, you would configure actual affiliate network parameters.
 */
export function buildAffiliateUrl(link: AffiliateLink): string {
  const url = new URL(link.url);
  if (link.tag) {
    url.searchParams.set('tag', link.tag);
  }
  url.searchParams.set('ref', 'affiliate-site');
  return url.toString();
}

/**
 * Validates that an affiliate link has all required fields.
 */
export function isValidAffiliateLink(link: Partial<AffiliateLink>): link is AffiliateLink {
  return Boolean(link.url && link.merchant && link.productName);
}
