export interface MetadataInput {
  title: string;
  description: string;
  canonicalUrl: string;
  image?: string;
  type?: 'website' | 'article';
}

export function generateMetaTags(input: MetadataInput): Record<string, string>[] {
  const tags: Record<string, string>[] = [
    { name: 'description', content: input.description },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: input.canonicalUrl },
    { property: 'og:type', content: input.type ?? 'website' },
  ];

  if (input.image) {
    tags.push({ property: 'og:image', content: input.image });
  }

  return tags;
}
