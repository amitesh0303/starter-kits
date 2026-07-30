import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';

/**
 * Accessibility tests using axe-core via Playwright.
 * Fails on serious and critical WCAG 2.0/2.1 violations on all pages.
 */

const distDir = resolve(import.meta.dirname, '../../dist');

const pages = ['/', '/about/', '/projects/', '/contact/'];

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
  };
  return mimeTypes[ext] ?? 'application/octet-stream';
}

function createStaticServer(dir: string): Promise<{ server: Server; port: number }> {
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

    server.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolvePromise({ server, port });
    });
  });
}

describe('Accessibility: axe-core on all pages', () => {
  let browser: Browser;
  let server: Server;
  let PORT: number;

  beforeAll(async () => {
    if (!existsSync(distDir)) {
      throw new Error('dist/ directory not found. Run `pnpm build` before output tests.');
    }
    const result = await createStaticServer(distDir);
    server = result.server;
    PORT = result.port;
    browser = await chromium.launch();
  }, 30000);

  afterAll(async () => {
    await browser?.close();
    server?.close();
  });

  for (const pagePath of pages) {
    it(`${pagePath} has no serious or critical accessibility violations`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`http://localhost:${PORT}${pagePath}`);

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
        expect.fail(`Accessibility violations on ${pagePath}:\n${details}`);
      }

      await page.close();
      await context.close();
    });
  }
});
