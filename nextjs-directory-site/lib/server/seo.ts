import type { Listing } from "@/domain/entities";

export interface LocalBusinessJsonLdInput {
  listing: Listing;
  canonicalUrl: string;
}

export function generateLocalBusinessJsonLd(input: LocalBusinessJsonLdInput): string {
  const { listing, canonicalUrl } = input;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.name,
    description: listing.description,
    url: canonicalUrl,
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.website ? { sameAs: listing.website } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
    },
  };

  return JSON.stringify(structuredData);
}

export function generateDirectoryBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
