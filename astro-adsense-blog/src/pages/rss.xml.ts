import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { isPublishable } from '../seo/indexable-document';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  const siteUrl = context.site?.toString().replace(/\/$/, '') ?? 'https://example.com';

  // Filter: published, not draft, not future-dated
  // Order: newest-first with slug as deterministic tie-breaker
  const eligible = articles
    .filter(isPublishable)
    .sort((a, b) => {
      const dateCompare = b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.id.localeCompare(b.id);
    });

  return rss({
    title: 'Astro AdSense Blog',
    description: 'Latest articles about web development, performance, and modern frontend techniques.',
    site: siteUrl,
    items: eligible.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.publishedAt,
      link: `/articles/${article.id}/`,
    })),
  });
}
