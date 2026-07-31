import { describe, it, expect } from 'vitest';
import {
  toIndexableDocument,
  isPublishable,
  type ArticleEntry,
} from '../../src/seo/indexable-document.js';

function makeArticle(overrides: Partial<ArticleEntry['data']> = {}): ArticleEntry {
  return {
    id: 'test-article',
    data: {
      title: 'A Test Article Title That Is Long Enough',
      description: 'A test description that is long enough to pass the minimum fifty character check.',
      author: 'author-1',
      category: 'category-1',
      publishedAt: new Date('2024-01-15'),
      tags: ['test'],
      ...overrides,
    },
  };
}

const siteUrl = 'https://example.com';

describe('toIndexableDocument', () => {
  it('projects an article entry to IndexableDocument with correct fields', () => {
    const article = makeArticle();
    const doc = toIndexableDocument(article, siteUrl);

    expect(doc.title).toBe(article.data.title);
    expect(doc.description).toBe(article.data.description);
    expect(doc.canonicalUrl).toBe('https://example.com/articles/test-article/');
    expect(doc.publishedAt).toBe('2024-01-15T00:00:00.000Z');
    expect(doc.robots).toBe('index, follow');
  });

  it('sets noindex for draft articles', () => {
    const article = makeArticle({ draft: true });
    const doc = toIndexableDocument(article, siteUrl);

    expect(doc.robots).toBe('noindex, nofollow');
  });

  it('sets noindex for future-dated articles', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const article = makeArticle({ publishedAt: futureDate });
    const doc = toIndexableDocument(article, siteUrl);

    expect(doc.robots).toBe('noindex, nofollow');
  });

  it('includes updatedAt when provided', () => {
    const article = makeArticle({ updatedAt: new Date('2024-06-01') });
    const doc = toIndexableDocument(article, siteUrl);

    expect(doc.updatedAt).toBe('2024-06-01T00:00:00.000Z');
  });

  it('includes structured data with schema.org fields', () => {
    const article = makeArticle();
    const doc = toIndexableDocument(article, siteUrl);

    expect(doc.structuredData['@context']).toBe('https://schema.org');
    expect(doc.structuredData['@type']).toBe('Article');
    expect(doc.structuredData['headline']).toBe(article.data.title);
  });
});

describe('isPublishable', () => {
  it('returns true for published, non-draft, past-dated articles', () => {
    const article = makeArticle({
      draft: false,
      publishedAt: new Date('2024-01-15'),
    });
    expect(isPublishable(article)).toBe(true);
  });

  it('returns false for draft articles', () => {
    const article = makeArticle({ draft: true });
    expect(isPublishable(article)).toBe(false);
  });

  it('returns false for future-dated articles', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const article = makeArticle({ publishedAt: futureDate });
    expect(isPublishable(article)).toBe(false);
  });

  it('returns true when draft is undefined (defaults to false)', () => {
    const article: ArticleEntry = {
      id: 'no-draft-field',
      data: {
        title: 'A Test Article Title That Is Long Enough',
        description: 'A test description that is long enough to pass the minimum fifty character check.',
        author: 'author-1',
        category: 'category-1',
        publishedAt: new Date('2024-01-15'),
        tags: ['test'],
      },
    };
    expect(isPublishable(article)).toBe(true);
  });
});
