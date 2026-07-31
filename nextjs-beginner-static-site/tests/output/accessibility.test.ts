import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as cheerio from 'cheerio';

/**
 * Basic accessibility checks on built HTML output.
 * Does not require a browser - uses cheerio to parse HTML.
 */

const outDir = resolve(import.meta.dirname, '../../out');

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

describe('Accessibility: basic HTML checks', () => {
  it('all pages have a lang attribute on <html>', () => {
    if (!existsSync(outDir)) {
      throw new Error('out/ directory not found. Run `pnpm build` before output tests.');
    }

    const htmlFiles = getHtmlFiles(outDir);
    const issues: string[] = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const lang = $('html').attr('lang');
      if (!lang) {
        issues.push(file);
      }
    }

    if (issues.length > 0) {
      expect.fail(
        `Pages missing lang attribute:\n${issues.join('\n')}`,
      );
    }
  });

  it('all images have alt attributes', () => {
    if (!existsSync(outDir)) {
      throw new Error('out/ directory not found. Run `pnpm build` before output tests.');
    }

    const htmlFiles = getHtmlFiles(outDir);
    const issues: string[] = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);

      $('img').each((_, el) => {
        const alt = $(el).attr('alt');
        if (alt === undefined) {
          const src = $(el).attr('src') ?? 'unknown';
          issues.push(`${file}: <img src="${src}"> missing alt`);
        }
      });
    }

    if (issues.length > 0) {
      expect.fail(
        `Images missing alt attributes:\n${issues.join('\n')}`,
      );
    }
  });

  it('navigation has aria-label', () => {
    if (!existsSync(outDir)) {
      throw new Error('out/ directory not found. Run `pnpm build` before output tests.');
    }

    const htmlFiles = getHtmlFiles(outDir);
    const issues: string[] = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);

      $('nav').each((_, el) => {
        const ariaLabel = $(el).attr('aria-label');
        if (!ariaLabel) {
          issues.push(file);
        }
      });
    }

    if (issues.length > 0) {
      expect.fail(
        `<nav> elements missing aria-label:\n${issues.join('\n')}`,
      );
    }
  });
});
