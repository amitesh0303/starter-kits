import type { APIContext } from 'astro';
import { generateRobotsTxt } from '../seo/robots';

export async function GET(context: APIContext) {
  const siteUrl = context.site?.toString().replace(/\/$/, '') ?? 'https://example.com';
  const body = generateRobotsTxt(siteUrl);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
