import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Server } from 'node:http';
import { createStaticServer } from '../helpers/static-server';

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
