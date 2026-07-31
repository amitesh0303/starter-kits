/**
 * Site-wide configuration.
 * Edit these values to personalise your site.
 */
export const SiteConfig = {
  /** Displayed in the browser tab, header, and footer */
  siteName: 'My Portfolio',
  /** Used by the sitemap and canonical URLs - replace before deploying */
  siteUrl: 'https://example.com',
  /** Default meta description for SEO */
  description: 'A simple static portfolio built with Next.js',
  /** Shown in the footer and used in meta tags */
  author: 'Your Name',
  /** Displayed on the contact page as a mailto: link */
  contactEmail: 'your-email@example.com',
} as const;
