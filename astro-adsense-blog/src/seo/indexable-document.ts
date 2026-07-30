export interface IndexableDocument {
  title: string;
  description: string;
  canonicalUrl: string;
  publishedAt: string;
  updatedAt?: string;
  robots: string;
  structuredData: Record<string, unknown>;
}

export interface ArticleEntry {
  id: string;
  data: {
    title: string;
    description: string;
    author: string;
    category: string;
    publishedAt: Date;
    updatedAt?: Date;
    draft?: boolean;
    image?: string;
    tags: string[];
  };
}

/**
 * Projects an Article collection entry into an IndexableDocument.
 * Non-indexable articles (drafts, future-dated) get noindex robots directive.
 */
export function toIndexableDocument(
  article: ArticleEntry,
  siteUrl: string,
): IndexableDocument {
  const slug = article.id;
  const canonicalUrl = `${siteUrl}/articles/${slug}/`;
  const now = new Date();
  const isFuture = article.data.publishedAt > now;
  const isDraft = article.data.draft ?? false;
  const isIndexable = !isDraft && !isFuture;

  return {
    title: article.data.title,
    description: article.data.description,
    canonicalUrl,
    publishedAt: article.data.publishedAt.toISOString(),
    updatedAt: article.data.updatedAt?.toISOString(),
    robots: isIndexable ? 'index, follow' : 'noindex, nofollow',
    structuredData: buildArticleStructuredData(article, canonicalUrl),
  };
}

function buildArticleStructuredData(
  article: ArticleEntry,
  canonicalUrl: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.data.title,
    description: article.data.description,
    datePublished: article.data.publishedAt.toISOString(),
    dateModified: (article.data.updatedAt ?? article.data.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: article.data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Astro AdSense Blog',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
}

/**
 * Returns true if an article is eligible for public indexing and feed inclusion.
 */
export function isPublishable(article: ArticleEntry): boolean {
  const now = new Date();
  return !(article.data.draft ?? false) && article.data.publishedAt <= now;
}
