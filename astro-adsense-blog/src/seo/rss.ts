import type { ArticleEntry } from './indexable-document.js';
import { isPublishable } from './indexable-document.js';
import { sortArticles } from '../lib/sort-articles.js';

export interface RssFeedItem {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
}

/**
 * Filters and sorts articles for RSS feed eligibility.
 * Excludes drafts and future-dated entries.
 * Orders newest-first with slug as deterministic tie-breaker.
 */
export function getRssEligibleArticles(
  articles: ArticleEntry[],
  siteUrl: string,
): RssFeedItem[] {
  return sortArticles(articles.filter(isPublishable)).map((article) => ({
    title: article.data.title,
    description: article.data.description,
    pubDate: article.data.publishedAt,
    link: `${siteUrl}/articles/${article.id}/`,
  }));
}
