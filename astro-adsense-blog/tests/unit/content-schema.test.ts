import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'astro/zod';

/**
 * Content schema constraints validated with fast-check property tests.
 * These mirror the schemas defined in src/content.config.ts.
 */

const articleSchema = z.object({
  title: z.string().min(30).max(60),
  description: z.string().min(50).max(160),
  author: z.string(),
  category: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  tags: z.array(z.string()),
});

describe('Content Schema - Article', () => {
  it('accepts titles between 30 and 60 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 30, maxLength: 60 }),
        (title) => {
          const result = articleSchema.safeParse({
            title,
            description: 'A'.repeat(50),
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(true);
        },
      ),
    );
  });

  it('rejects titles shorter than 30 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 29 }),
        (title) => {
          const result = articleSchema.safeParse({
            title,
            description: 'A'.repeat(50),
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  it('rejects titles longer than 60 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 61, maxLength: 200 }),
        (title) => {
          const result = articleSchema.safeParse({
            title,
            description: 'A'.repeat(50),
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  it('accepts descriptions between 50 and 160 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 50, maxLength: 160 }),
        (description) => {
          const result = articleSchema.safeParse({
            title: 'A'.repeat(30),
            description,
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(true);
        },
      ),
    );
  });

  it('rejects descriptions shorter than 50 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 49 }),
        (description) => {
          const result = articleSchema.safeParse({
            title: 'A'.repeat(30),
            description,
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  it('rejects descriptions longer than 160 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 161, maxLength: 300 }),
        (description) => {
          const result = articleSchema.safeParse({
            title: 'A'.repeat(30),
            description,
            author: 'author-1',
            category: 'category-1',
            publishedAt: '2024-01-15',
            tags: ['test'],
          });
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  it('coerces publishedAt string to Date', () => {
    const result = articleSchema.safeParse({
      title: 'A'.repeat(30),
      description: 'B'.repeat(50),
      author: 'author-1',
      category: 'category-1',
      publishedAt: '2024-06-01',
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publishedAt).toBeInstanceOf(Date);
    }
  });

  it('defaults draft to false when omitted', () => {
    const result = articleSchema.safeParse({
      title: 'A'.repeat(30),
      description: 'B'.repeat(50),
      author: 'author-1',
      category: 'category-1',
      publishedAt: '2024-06-01',
      tags: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draft).toBe(false);
    }
  });
});
