export interface ArticleJsonLdInput {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  canonicalUrl: string;
  image?: string;
}

export function generateArticleJsonLd(input: ArticleJsonLdInput): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    author: {
      "@type": "Person",
      name: input.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Magazine Site",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.canonicalUrl,
    },
    ...(input.image ? { image: input.image } : {}),
  };

  return JSON.stringify(structuredData);
}
