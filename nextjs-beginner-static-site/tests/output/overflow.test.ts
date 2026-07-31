import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as cheerio from 'cheerio';

/**
 * Viewport overflow heuristic: ensure no inline styles set fixed widths
 * larger than common mobile viewports. A lightweight check that catches
 * common overflow causes without requiring a browser.
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

describe('Viewport Overflow Heuristics', () => {
  it('no inline fixed widths exceeding mobile viewport (375px)', () => {
    if (!existsSync(outDir)) {
      throw new Error('out/ directory not found. Run `pnpm build` before output tests.');
    }

    const htmlFiles = getHtmlFiles(outDir);
    const issues: string[] = [];

    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      const $ = cheerio.load(html);

      $('[style]').each((_, el) => {
        const style = $(el).attr('style') ?? '';
        const widthMatch = style.match(/width\s*:\s*(\d+)px/);
        if (widthMatch) {
          const width = parseInt(widthMatch[1], 10);
          if (width > 375) {
            issues.push(`${file}: inline width ${width}px`);
          }
        }
      });
    }

    if (issues.length > 0) {
      expect.fail(
        `Found ${issues.length} elements with fixed widths > 375px:\n${issues.join('\n')}`,
      );
    }
  });
});
