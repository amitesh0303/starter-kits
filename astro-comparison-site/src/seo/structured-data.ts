export interface ComparisonProduct {
  name: string;
  brand?: string;
  rating: number;
  price: string;
  url: string;
}

export interface ComparisonJsonLdInput {
  title: string;
  description: string;
  authorName: string;
  publishedAt: string;
  canonicalUrl: string;
  products: ComparisonProduct[];
}

/**
 * Generates ItemList JSON-LD for comparison pages with schema.org structured data.
 */
export function generateComparisonJsonLd(input: ComparisonJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.title,
    description: input.description,
    numberOfItems: input.products.length,
    itemListElement: input.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
        review: {
          '@type': 'Review',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: product.rating,
            bestRating: 5,
          },
        },
      },
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
  };

  return JSON.stringify(structuredData);
}

export interface ProductJsonLdInput {
  name: string;
  description: string;
  brand?: string;
  url: string;
  ratingValue?: number;
}

export function generateProductJsonLd(input: ProductJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.brand ? { brand: { '@type': 'Brand', name: input.brand } } : {}),
    ...(input.ratingValue
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: input.ratingValue,
            bestRating: 5,
            reviewCount: 1,
          },
        }
      : {}),
  };

  return JSON.stringify(structuredData);
}
