import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  return rss({
    title: 'Recipe Site',
    description: 'Delicious recipes with step-by-step instructions',
    site: context.site!.toString(),
    items: [],
  });
}
