/**
 * Generates robots.txt content.
 * Allows all crawlers, references sitemap, and disallows draft paths.
 */
export function generateRobotsTxt(siteUrl: string): string {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap-index.xml`,
  ];

  return lines.join('\n') + '\n';
}
