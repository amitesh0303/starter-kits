import type { LandingPage } from "@/domain/entities";

export function generateLandingPageJsonLd(page: LandingPage, canonicalUrl: string): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: canonicalUrl,
    datePublished: page.publishedAt.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    keywords: page.keywords.join(", "),
  };

  return JSON.stringify(structuredData);
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
