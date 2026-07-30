import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createServer, type Server } from 'node:http';

/**
 * Performance tests: page weight budget and CLS verification.
 */

const distDir = resolve(import.meta.dirname, '../../dist');
// Budget: 200KB per page (HTML + inline CSS/JS)
const PAGE_WEIGHT_BUDGET_BYTES = 200 * 1024;

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

describe('Performance: Page Weight and CLS', () => {
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

  it('all HTML pages are within page weight budget (200KB)', () => {
    const htmlFiles = getHtmlFiles(distDir);
    const overBudget: Array<{ file: string; size: number }> = [];

    for (const file of htmlFiles) {
      const stat = statSync(file);
      if (stat.size > PAGE_WEIGHT_BUDGET_BYTES) {
        overBudget.push({ file, size: stat.size });
      }
    }

    if (overBudget.length > 0) {
      const details = overBudget
        .map((f) => `  ${f.file}: ${(f.size / 1024).toFixed(1)}KB`)
        .join('\n');
      expect.fail(`Pages exceeding weight budget:\n${details}`);
    }
  });

  it('home page has CLS <= 0.10', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });

    // Observe layout shifts
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cumulativeScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!layoutShift.hadRecentInput && layoutShift.value) {
              cumulativeScore += layoutShift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        // Wait a bit for any shifts to be recorded
        setTimeout(() => {
          observer.disconnect();
          resolve(cumulativeScore);
        }, 1000);
      });
    });

    expect(cls, 'CLS should be <= 0.10').toBeLessThanOrEqual(0.1);
    await page.close();
  });

  it('article page has CLS <= 0.10', async () => {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1024, height: 768 });

    await page.goto(
      `http://localhost:${PORT}/articles/getting-started-with-astro-framework/`,
      { waitUntil: 'networkidle' },
    );

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let cumulativeScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!layoutShift.hadRecentInput && layoutShift.value) {
              cumulativeScore += layoutShift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(cumulativeScore);
        }, 1000);
      });
    });

    expect(cls, 'CLS should be <= 0.10').toBeLessThanOrEqual(0.1);
    await page.close();
  });
});
