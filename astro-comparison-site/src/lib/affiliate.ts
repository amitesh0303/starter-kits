export interface AffiliateLink {
  url: string;
  productName: string;
  tag?: string;
}

export function buildAffiliateUrl(link: AffiliateLink): string {
  const url = new URL(link.url);
  if (link.tag) {
    url.searchParams.set('tag', link.tag);
  }
  url.searchParams.set('ref', 'comparison-site');
  return url.toString();
}

export function isValidAffiliateLink(link: Partial<AffiliateLink>): link is AffiliateLink {
  return Boolean(link.url && link.productName);
}
