import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer, type Server } from 'node:http';
import { readFileSync } from 'node:fs';

/**
 * Keyboard navigation and focus indicator tests.
 * Verifies all nav links are reachable via Tab and have visible focus styles.
 */

const distDir = resolve(import.meta.dirname, '../../dist');

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

describe('Keyboard Navigation and Focus Indicators', () => {
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

  it('all navigation links are reachable via keyboard Tab', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/`);

    // Get all nav links
    const navLinks = await page.locator('nav a').all();
    expect(navLinks.length).toBeGreaterThan(0);

    // Tab through focusable elements and collect focused nav links
    const focusedNavHrefs: string[] = [];
    const totalNavLinks = navLinks.length;

    // Tab enough times to reach all nav links (account for skip links etc.)
    for (let i = 0; i < totalNavLinks + 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (el?.tagName === 'A' && el.closest('nav')) {
          return (el as HTMLAnchorElement).getAttribute('href');
        }
        return null;
      });
      if (focused && !focusedNavHrefs.includes(focused)) {
        focusedNavHrefs.push(focused);
      }
    }

    // Every nav link should have been focused
    const navHrefs = await Promise.all(
      navLinks.map((link) => link.getAttribute('href')),
    );

    for (const href of navHrefs) {
      expect(focusedNavHrefs).toContain(href);
    }

    await page.close();
    await context.close();
  });

  it('focused navigation links have a visible focus indicator', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/`);

    // Focus the first nav link via Tab
    const navLinks = await page.locator('nav[aria-label="Main navigation"] ul a').all();
    expect(navLinks.length).toBeGreaterThan(0);

    // Tab until a nav link is focused
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const isNavFocused = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.tagName === 'A' && el.closest('nav[aria-label="Main navigation"] ul');
      });
      if (isNavFocused) break;
    }

    // Check that the focused element has a visible outline
    const outlineStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth,
        outlineColor: styles.outlineColor,
      };
    });

    expect(outlineStyle).not.toBeNull();
    expect(outlineStyle?.outlineStyle).not.toBe('none');
    expect(outlineStyle?.outlineWidth).not.toBe('0px');

    await page.close();
    await context.close();
  });
});
