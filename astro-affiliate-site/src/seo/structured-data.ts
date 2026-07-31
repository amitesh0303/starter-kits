export interface ReviewJsonLdInput {
  name: string;
  description: string;
  ratingValue: number;
  ratingBest?: number;
  authorName: string;
  publishedAt: string;
  canonicalUrl: string;
  image?: string;
  productName: string;
  productBrand?: string;
}

/**
 * Generates Review JSON-LD structured data with schema.org fields.
 */
export function generateReviewJsonLd(input: ReviewJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: input.name,
    description: input.description,
    datePublished: input.publishedAt,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: input.ratingValue,
      bestRating: input.ratingBest ?? 5,
    },
    itemReviewed: {
      '@type': 'Product',
      name: input.productName,
      ...(input.productBrand ? { brand: { '@type': 'Brand', name: input.productBrand } } : {}),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
    ...(input.image ? { image: input.image } : {}),
  };

  return JSON.stringify(structuredData);
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  brand?: string;
  image?: string;
  url: string;
  ratingValue?: number;
  reviewCount?: number;
}

/**
 * Generates Product JSON-LD structured data.
 */
export function generateProductJsonLd(input: ProductJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    ...(input.image ? { image: input.image } : {}),
    ...(input.ratingValue
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: input.ratingValue,
            reviewCount: input.reviewCount ?? 1,
          },
        }
      : {}),
  };

  return JSON.stringify(structuredData);
}
