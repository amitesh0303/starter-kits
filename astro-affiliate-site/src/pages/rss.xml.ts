import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  return rss({
    title: 'Affiliate Reviews Site',
    description: 'In-depth product reviews and buying guides',
    site: context.site!.toString(),
    items: [],
  });
}
