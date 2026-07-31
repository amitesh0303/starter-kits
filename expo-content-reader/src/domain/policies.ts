import { Article, ReadingProgress, Bookmark } from "./entities";

/** Estimate reading time based on word count. */
export function estimateReadTime(wordCount: number, wpm: number = 200): number {
  return Math.max(1, Math.ceil(wordCount / wpm));
}

/** Check if an article is considered read (>= 90% scroll). */
export function isArticleRead(progress: ReadingProgress): boolean {
  return progress.completed || progress.scrollPercent >= 90;
}

/** Get unread articles (not in progress or < 90%). */
export function getUnreadArticles(articles: Article[], progressMap: Map<string, ReadingProgress>): Article[] {
  return articles.filter(a => {
    const p = progressMap.get(a.id);
    return !p || !isArticleRead(p);
  });
}

/** Check if article is bookmarked. */
export function isBookmarked(articleId: string, bookmarks: Bookmark[]): boolean {
  return bookmarks.some(b => b.articleId === articleId);
}

/** Sort articles by publish date (newest first). */
export function sortByDate(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
