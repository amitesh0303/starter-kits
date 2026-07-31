import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getRssEligibleArticles } from '../../src/seo/rss.js';
import type { ArticleEntry } from '../../src/seo/indexable-document.js';

const siteUrl = 'https://example.com';

function makeArticle(id: string, overrides: Partial<ArticleEntry['data']> = {}): ArticleEntry {
  return {
    id,
    data: {
      title: 'A Test Article Title That Is Long Enough',
      description: 'A test description that is long enough to pass the minimum fifty character check.',
      author: 'author-1',
      category: 'category-1',
      publishedAt: new Date('2024-01-15'),
      tags: ['test'],
      draft: false,
      ...overrides,
    },
  };
}

describe('RSS - Property 12: Eligibility and Deterministic Order', () => {
  it('excludes draft articles from RSS feed', () => {
    const articles = [
      makeArticle('published', { publishedAt: new Date('2024-01-15') }),
      makeArticle('draft', { publishedAt: new Date('2024-01-10'), draft: true }),
    ];

    const result = getRssEligibleArticles(articles, siteUrl);
    expect(result).toHaveLength(1);
    expect(result[0].link).toContain('published');
  });

  it('excludes future-dated articles from RSS feed', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const articles = [
      makeArticle('published', { publishedAt: new Date('2024-01-15') }),
      makeArticle('future', { publishedAt: futureDate }),
    ];

    const result = getRssEligibleArticles(articles, siteUrl);
    expect(result).toHaveLength(1);
    expect(result[0].link).toContain('published');
  });

  it('orders articles newest-first', () => {
    const articles = [
      makeArticle('older', { publishedAt: new Date('2024-01-01') }),
      makeArticle('newer', { publishedAt: new Date('2024-06-01') }),
      makeArticle('middle', { publishedAt: new Date('2024-03-15') }),
    ];

    const result = getRssEligibleArticles(articles, siteUrl);
    expect(result.map((r) => r.link)).toEqual([
      'https://example.com/articles/newer/',
      'https://example.com/articles/middle/',
      'https://example.com/articles/older/',
    ]);
  });

  it('uses slug as tie-breaker for same-date articles', () => {
    const sameDate = new Date('2024-03-15');
    const articles = [
      makeArticle('zeta-article', { publishedAt: sameDate }),
      makeArticle('alpha-article', { publishedAt: sameDate }),
      makeArticle('beta-article', { publishedAt: sameDate }),
    ];

    const result = getRssEligibleArticles(articles, siteUrl);
    expect(result.map((r) => r.link)).toEqual([
      'https://example.com/articles/alpha-article/',
      'https://example.com/articles/beta-article/',
      'https://example.com/articles/zeta-article/',
    ]);
  });

  it('property: eligible articles are always in newest-first deterministic order', () => {
    const articleArb = fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-z0-9-]+$/.test(s)),
      publishedAt: fc.date({
        min: new Date('2020-01-01'),
        max: new Date('2024-12-31'),
      }),
      draft: fc.boolean(),
    });

    fc.assert(
      fc.property(
        fc.uniqueArray(articleArb, { selector: (a) => a.id, minLength: 0, maxLength: 20 }),
        (articleData) => {
          const articles: ArticleEntry[] = articleData.map((a) =>
            makeArticle(a.id, { publishedAt: a.publishedAt, draft: a.draft }),
          );

        const result = getRssEligibleArticles(articles, siteUrl);

          // All results should be non-draft and not future-dated
          const now = new Date();
          for (const item of result) {
            const slug = item.link.replace('https://example.com/articles/', '').replace('/', '');
            const original = articles.find((a) => a.id === slug);
            expect(original).toBeDefined();
            expect(original!.data.draft).not.toBe(true);
            expect(original!.data.publishedAt.getTime()).toBeLessThanOrEqual(now.getTime());
          }

          // Verify newest-first order with slug tie-breaker
          for (let i = 1; i < result.length; i++) {
            const prev = result[i - 1];
            const curr = result[i];
            const prevDate = prev.pubDate.getTime();
            const currDate = curr.pubDate.getTime();

            if (prevDate === currDate) {
              // Slug tie-breaker: alphabetical ascending
              expect(prev.link <= curr.link).toBe(true);
            } else {
              // Newest first
              expect(prevDate >= currDate).toBe(true);
            }
          }
        },
      ),
    );
  });
});
