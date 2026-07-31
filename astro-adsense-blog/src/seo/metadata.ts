export interface PageMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
}

/**
 * Generates bounded unique page metadata.
 * Title: 30-60 characters, Description: 50-160 characters.
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  canonicalUrl: string;
  robots?: string;
  siteName?: string;
}): PageMetadata {
  const siteName = options.siteName ?? 'Astro AdSense Blog';
  const robots = options.robots ?? 'index, follow';

  // Ensure title is within 30-60 chars
  let title = options.title;
  if (title.length < 30) {
    title = `${title} | ${siteName}`.slice(0, 60);
  }
  if (title.length > 60) {
    title = title.slice(0, 57) + '...';
  }

  // Ensure description is within 50-160 chars
  let description = options.description;
  if (description.length < 50) {
    description = description.padEnd(50, '.');
  }
  if (description.length > 160) {
    description = description.slice(0, 157) + '...';
  }

  return {
    title,
    description,
    canonicalUrl: options.canonicalUrl,
    robots,
  };
}
