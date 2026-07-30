import { existsSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { join, extname, resolve, normalize } from 'node:path';

/**
 * Shared static file server for output tests.
 * Serves files from the given directory on a random available port.
 * Includes path traversal protection to prevent reads outside the root.
 */

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

export function createStaticServer(dir: string): Promise<{ server: Server; port: number }> {
  const rootDir = resolve(dir);

  return new Promise((resolvePromise) => {
    const server = createServer((req, res) => {
      // Strip query string and decode URI
      const pathname = decodeURIComponent((req.url ?? '/').split('?')[0]);

      // Resolve the file path and ensure it stays within the root directory
      let filePath = normalize(join(rootDir, pathname));
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

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
