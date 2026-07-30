import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        // Exclude draft and non-indexable pages from sitemap.
        // Draft articles won't appear in static paths by default since
        // the publish flow filters them, but this provides an extra guard.
        return !page.includes('/draft-');
      },
    }),
  ],
});
