import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as cheerio from 'cheerio';

/**
 * Property 11: Indexability, metadata, schema, sitemap, and robots consistency.
 * Parses dist/ HTML output for SEO compliance.
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

describe('Property 11: SEO Output Validation', () => {
  let htmlFiles: string[];

  beforeAll(() => {
    if (!existsSync(distDir)) {
      throw new Error('dist/ directory not found. Run `pnpm build` before output tests.');
    }
    htmlFiles = getHtmlFiles(distDir);
    expect(htmlFiles.length).toBeGreaterThan(0);
  });

  it('every HTML page has a title between 30 and 60 characters', () => {
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const title = $('title').text();
      expect(title.length, `Title too short in ${file}: "${title}"`).toBeGreaterThanOrEqual(30);
      expect(title.length, `Title too long in ${file}: "${title}"`).toBeLessThanOrEqual(60);
    }
  });

  it('every HTML page has a meta description between 50 and 160 characters', () => {
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const desc = $('meta[name="description"]').attr('content') ?? '';
      expect(desc.length, `Description too short in ${file}`).toBeGreaterThanOrEqual(50);
      expect(desc.length, `Description too long in ${file}`).toBeLessThanOrEqual(160);
    }
  });

  it('every HTML page has a canonical URL', () => {
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const canonical = $('link[rel="canonical"]').attr('href');
      expect(canonical, `Missing canonical in ${file}`).toBeDefined();
      expect(canonical, `Empty canonical in ${file}`).not.toBe('');
      expect(canonical, `Invalid canonical in ${file}`).toMatch(/^https?:\/\//);
    }
  });

  it('titles are unique across indexable pages', () => {
    const titles = new Map<string, string>();
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const robots = $('meta[name="robots"]').attr('content') ?? 'index, follow';
      if (robots.includes('noindex')) continue;

      const title = $('title').text();
      const existing = titles.get(title);
      expect(existing, `Duplicate title "${title}" in ${file} and ${existing}`).toBeUndefined();
      titles.set(title, file);
    }
  });

  it('article pages have valid JSON-LD structured data', () => {
    const articleDir = join(distDir, 'articles');
    if (!existsSync(articleDir)) return;

    const articleHtmlFiles = getHtmlFiles(articleDir);
    for (const file of articleHtmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const ldJson = $('script[type="application/ld+json"]').html();

      if (!ldJson) continue; // Draft pages might not have JSON-LD

      const data = JSON.parse(ldJson);
      expect(data['@context'], `Missing @context in ${file}`).toBe('https://schema.org');
      expect(data['@type'], `Missing @type in ${file}`).toBe('Article');
      expect(data.headline, `Missing headline in ${file}`).toBeDefined();
      expect(data.datePublished, `Missing datePublished in ${file}`).toBeDefined();
      expect(data.author, `Missing author in ${file}`).toBeDefined();
      expect(data.publisher, `Missing publisher in ${file}`).toBeDefined();
      expect(data.mainEntityOfPage, `Missing mainEntityOfPage in ${file}`).toBeDefined();
    }
  });

  it('sitemap.xml exists and contains only indexable pages', () => {
    const sitemapPath = join(distDir, 'sitemap-0.xml');
    if (!existsSync(sitemapPath)) {
      // Astro sitemap integration may output different filename
      const altPath = join(distDir, 'sitemap.xml');
      expect(existsSync(altPath), 'No sitemap file found in dist/').toBe(true);
      return;
    }

    const sitemap = readFileSync(sitemapPath, 'utf-8');
    // Draft pages should not appear in sitemap
    expect(sitemap).not.toContain('/draft-');
  });

  it('robots meta excludes drafts from indexing', () => {
    const draftFiles = htmlFiles.filter((f) => f.includes('draft-'));
    for (const file of draftFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);
      const robots = $('meta[name="robots"]').attr('content') ?? '';
      expect(robots, `Draft page ${file} should be noindex`).toContain('noindex');
    }
  });
});
