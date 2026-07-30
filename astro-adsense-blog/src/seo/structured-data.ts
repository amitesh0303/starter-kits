export interface ArticleJsonLdInput {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
  canonicalUrl: string;
  image?: string;
}

/**
 * Generates Article JSON-LD structured data with required schema.org fields.
 */
export function generateArticleJsonLd(input: ArticleJsonLdInput): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Astro AdSense Blog',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.canonicalUrl,
    },
    ...(input.image ? { image: input.image } : {}),
  };

  return JSON.stringify(structuredData);
}
