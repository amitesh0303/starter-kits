import type { ArticleEntry } from '../seo/indexable-document.js';

/**
 * Sorts articles in deterministic order: newest-first (publishedAt descending),
 * with slug (id) alphabetical ascending as tie-breaker.
 */
export function sortArticles(articles: ArticleEntry[]): ArticleEntry[] {
  return [...articles].sort((a, b) => {
    const dateCompare = b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.id.localeCompare(b.id);
  });
}
