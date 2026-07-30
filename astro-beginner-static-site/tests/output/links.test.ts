import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as cheerio from 'cheerio';

/**
 * Built-output link validation: Crawl dist/ for broken internal links.
 */

const distDir = resolve(import.meta.dirname, '../../dist');

function getHtmlFiles(dir: string): string[] {
  const files: string[] = [];
  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('Built-Output Internal Links', () => {
  let htmlFiles: string[];

  beforeAll(() => {
    if (!existsSync(distDir)) {
      throw new Error('dist/ directory not found. Run `pnpm build` before output tests.');
    }
    htmlFiles = getHtmlFiles(distDir);
  });

  it('all internal links resolve to existing pages', () => {
    const brokenLinks: Array<{ file: string; href: string }> = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        // Skip external links, anchors, mailto, tel, javascript
        if (
          href.startsWith('http://') ||
          href.startsWith('https://') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('javascript:')
        ) {
          return;
        }

        // Normalize the internal path
        let normalizedHref = href;
        if (!normalizedHref.startsWith('/')) {
          const fileRelDir = file.replace(distDir, '').replace('/index.html', '/');
          normalizedHref = resolve(fileRelDir, normalizedHref).replace(/\/+/g, '/');
        }

        // Check if path resolves to a file in dist/
        const possiblePaths = [
          normalizedHref,
          normalizedHref + 'index.html',
          normalizedHref.replace(/\/$/, '') + '/index.html',
          normalizedHref.replace(/\/$/, '') + '.html',
          normalizedHref.replace(/\/$/, '') + '.xml',
        ];

        const resolvedPaths = possiblePaths.map((p) => join(distDir, p));
        const exists = resolvedPaths.some((p) => existsSync(p));

        if (!exists) {
          brokenLinks.push({ file, href });
        }
      });
    }

    if (brokenLinks.length > 0) {
      const details = brokenLinks
        .map((b) => `  ${b.file}: ${b.href}`)
        .join('\n');
      expect.fail(`Found ${brokenLinks.length} broken internal links:\n${details}`);
    }
  });

  it('sitemap.xml exists in dist/', () => {
    expect(existsSync(join(distDir, 'sitemap-index.xml'))).toBe(true);
  });
});
