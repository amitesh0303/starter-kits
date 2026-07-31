import type { Business, SearchQuery } from "../lib/entities";

export interface SearchAdapter {
  search(query: SearchQuery): Promise<{ businesses: Business[]; total: number }>;
}

function createFakeSearchAdapter(): SearchAdapter {
  const businesses: Business[] = [
    {
      id: "1",
      name: "Joe's Coffee Shop",
      description: "Artisan coffee and pastries in downtown Portland",
      category: "food-drink",
      address: "123 Main St",
      city: "Portland",
      latitude: 45.5152,
      longitude: -122.6784,
      phone: "+1-555-0101",
      website: "https://joes-coffee.example.com",
      rating: 4.7,
      reviewCount: 85,
      sponsored: false,
    },
    {
      id: "2",
      name: "Green Thumb Garden Center",
      description: "Local nursery with plants, tools, and landscaping services",
      category: "home-garden",
      address: "456 Oak Ave",
      city: "Portland",
      latitude: 45.5232,
      longitude: -122.6814,
      phone: "+1-555-0102",
      website: null,
      rating: 4.3,
      reviewCount: 42,
      sponsored: true,
    },
  ];

  return {
    async search(query) {
      const q = query.query.toLowerCase();
      const filtered = businesses.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q)
      );
      return { businesses: filtered, total: filtered.length };
    },
  };
}

export function useSearch(): SearchAdapter {
  const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
  if (!MEILISEARCH_URL || MEILISEARCH_URL === "http://localhost:7700") {
    return createFakeSearchAdapter();
  }
  return createFakeSearchAdapter();
}
