/**
 * SEO helper data for generating structured data and meta tags.
 */
module.exports = {
  generateArticleJsonLd(post, siteUrl) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      author: {
        "@type": "Person",
        name: "Site Admin",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${siteUrl}${post.url}`,
      },
    });
  },

  generateBreadcrumbJsonLd(items, siteUrl) {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.url}`,
      })),
    });
  },
};
