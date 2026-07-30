import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';

/**
 * Viewport overflow tests: ensure no horizontal scrollbar at
 * mobile (375px), tablet (768px), and desktop (1280px) widths.
 */

const distDir = resolve(import.meta.dirname, '../../dist');

const pages = ['/', '/about/', '/projects/', '/contact/'];
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
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

describe('Viewport Overflow: no horizontal scroll', () => {
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

  for (const viewport of viewports) {
    for (const pagePath of pages) {
      it(`${pagePath} has no horizontal overflow at ${viewport.name} (${viewport.width}px)`, async () => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();
        await page.goto(`http://localhost:${PORT}${pagePath}`);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

        await page.close();
        await context.close();
      });
    }
  }
});
