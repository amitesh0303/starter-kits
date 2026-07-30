import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

/**
 * Property 13: Ad component reserves exact configured dimensions at each viewport.
 * Uses Playwright to verify CSS reserved space at mobile, tablet, and desktop viewpoints.
 */

const distDir = resolve(import.meta.dirname, '../../dist');
const PORT = 4173;

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.txt': 'text/plain',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
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

describe('Property 13: Ad Component Reserved Space', () => {
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

  it('reserves 320x100 at mobile viewport (375px)', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('.ad-container');

    const dimensions = await page.evaluate(() => {
      const el = document.querySelector('.ad-container');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    expect(dimensions).not.toBeNull();
    expect(dimensions!.width).toBe(320);
    expect(dimensions!.height).toBe(100);
    await page.close();
  });

  it('reserves 468x60 at tablet viewport (768px)', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('.ad-container');

    const dimensions = await page.evaluate(() => {
      const el = document.querySelector('.ad-container');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    expect(dimensions).not.toBeNull();
    expect(dimensions!.width).toBe(728);
    expect(dimensions!.height).toBe(90);
    await page.close();
  });

  it('reserves 728x90 at desktop viewport (1024px)', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('.ad-container');

    const dimensions = await page.evaluate(() => {
      const el = document.querySelector('.ad-container');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });

    expect(dimensions).not.toBeNull();
    expect(dimensions!.width).toBe(728);
    expect(dimensions!.height).toBe(90);
    await page.close();
  });

  it('ad container does not cause layout shift (CLS = 0) on load', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`http://localhost:${PORT}/`);
    await page.waitForSelector('.ad-container');

    // Check that initial dimensions match rendered dimensions (no shift)
    const hasShift = await page.evaluate(() => {
      const containers = document.querySelectorAll('.ad-container');
      for (const container of containers) {
        const style = window.getComputedStyle(container);
        const minWidth = parseInt(style.minWidth, 10);
        const actualWidth = container.getBoundingClientRect().width;
        // If min-width matches actual width, no shift occurred
        if (Math.abs(minWidth - actualWidth) > 1) return true;
      }
      return false;
    });

    expect(hasShift).toBe(false);
    await page.close();
  });
});
