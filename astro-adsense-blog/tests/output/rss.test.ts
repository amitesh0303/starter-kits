import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as cheerio from 'cheerio';

/**
 * Built-output RSS test: Parse dist/rss.xml and verify eligibility filtering
 * and deterministic order.
 */

const distDir = resolve(import.meta.dirname, '../../dist');
const rssPath = resolve(distDir, 'rss.xml');

describe('Built-Output RSS Validation', () => {
  let rssContent: string;
  let $: cheerio.CheerioAPI;

  beforeAll(() => {
    if (!existsSync(rssPath)) {
      throw new Error('dist/rss.xml not found. Run `pnpm build` before output tests.');
    }
    rssContent = readFileSync(rssPath, 'utf-8');
    $ = cheerio.load(rssContent, { xml: true });
  });

  it('RSS feed is valid XML with channel element', () => {
    expect($('channel').length).toBe(1);
  });

  it('RSS feed does not contain draft articles', () => {
    const items = $('item');
    items.each((_, el) => {
      const link = $(el).find('link').text();
      expect(link).not.toContain('draft-');
    });
  });

  it('RSS feed items are in newest-first order', () => {
    const dates: Date[] = [];
    const items = $('item');

    items.each((_, el) => {
      const pubDate = $(el).find('pubDate').text();
      if (pubDate) {
        dates.push(new Date(pubDate));
      }
    });

    for (let i = 1; i < dates.length; i++) {
      expect(
        dates[i - 1].getTime(),
        `Item ${i - 1} should be newer than or equal to item ${i}`,
      ).toBeGreaterThanOrEqual(dates[i].getTime());
    }
  });

  it('RSS feed contains at least one published article', () => {
    const items = $('item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('each RSS item has title, description, link, and pubDate', () => {
    const items = $('item');
    items.each((_, el) => {
      expect($(el).find('title').text()).not.toBe('');
      expect($(el).find('description').text()).not.toBe('');
      expect($(el).find('link').text()).not.toBe('');
      expect($(el).find('pubDate').text()).not.toBe('');
    });
  });
});
