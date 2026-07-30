import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';

/**
 * Accessibility tests using axe-core via Playwright.
 * Fails on serious and critical violations.
 */

const distDir = resolve(import.meta.dirname, '../../dist');
const PORT = 4174;

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] ?? 'application/octet-stream';
}

function createStaticServer(dir: string, port: number): Promise<Server> {
  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      let filePath = join(dir, req.url ?? '/');
      if (filePath.endsWith('/')) filePath = join(filePath, 'index.html');
      if (!extname(filePath)) filePath = join(filePath, 'index.html');

      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
        res.end(content);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => resolvePromise(server));
  });
}

describe('Accessibility: axe-core on representative pages', () => {
  let browser: Browser;
  let server: Server;

  beforeAll(async () => {
    if (!existsSync(distDir)) {
      throw new Error('dist/ directory not found. Run `pnpm build` before output tests.');
    }
    server = await createStaticServer(distDir, PORT);
    browser = await chromium.launch();
  }, 30000);

  afterAll(async () => {
    await browser?.close();
    server?.close();
  });

  it('home page has no serious or critical accessibility violations', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/`);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    if (seriousOrCritical.length > 0) {
      const details = seriousOrCritical
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
        .join('\n');
      expect.fail(`Accessibility violations on home page:\n${details}`);
    }

    await page.close();
    await context.close();
  });

  it('article page has no serious or critical accessibility violations', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Navigate to the first published article
    await page.goto(`http://localhost:${PORT}/articles/getting-started-with-astro-framework/`);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    if (seriousOrCritical.length > 0) {
      const details = seriousOrCritical
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
        .join('\n');
      expect.fail(`Accessibility violations on article page:\n${details}`);
    }

    await page.close();
    await context.close();
  });
});
