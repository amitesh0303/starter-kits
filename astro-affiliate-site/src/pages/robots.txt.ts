import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://example.com/sitemap-index.xml',
  ].join('\n');

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
