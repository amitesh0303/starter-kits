import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Beginner Note: Static Output
 * ----------------------------
 * The `output: 'static'` option tells Astro to pre-render every page at build
 * time into plain HTML files. This means your site does NOT need a server to
 * run in production - you can deploy the generated `dist/` folder to any
 * static hosting provider (Cloudflare Pages, GitHub Pages, Netlify, etc.).
 *
 * The `site` field is used by the sitemap integration to generate absolute URLs.
 * Replace 'https://example.com' with your actual domain before deploying.
 */
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [sitemap()],
});
