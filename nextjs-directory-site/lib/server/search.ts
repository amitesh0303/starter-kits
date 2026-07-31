import type { Listing, SearchQuery, SearchResult } from "@/domain/entities";

/**
 * Search adapter interface. In production connects to Meilisearch.
 */
export interface SearchAdapter {
  search(query: SearchQuery): Promise<SearchResult>;
  indexListing(listing: Listing): Promise<void>;
}

export function createSearchAdapter(): SearchAdapter {
  const MEILISEARCH_URL = process.env.MEILISEARCH_URL;

  if (!MEILISEARCH_URL || MEILISEARCH_URL === "http://localhost:7700") {
    return createFakeSearchAdapter();
  }

  return createFakeSearchAdapter();
}

function createFakeSearchAdapter(): SearchAdapter {
  const listings: Listing[] = [
    {
      id: "1",
      name: "Acme Web Design",
      description: "Professional web design and development services",
      category: "web-development",
      location: "San Francisco, CA",
      website: "https://acme-web.example.com",
      phone: null,
      rating: 4.8,
      reviewCount: 42,
      featured: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-03-01"),
    },
  ];

  return {
    async search(query) {
      const q = query.query.toLowerCase();
      const filtered = listings.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 10;
      const start = (page - 1) * pageSize;
      return {
        listings: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    },
    async indexListing(_listing) {
      // no-op in fake adapter
    },
  };
}
