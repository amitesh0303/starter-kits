import type { Business, DirectoryCategory } from "../lib/entities";

export interface DatabaseAdapter {
  getBusinesses(page: number, pageSize: number): Promise<{ businesses: Business[]; total: number }>;
  getBusinessById(id: string): Promise<Business | null>;
  getCategories(): Promise<DirectoryCategory[]>;
  getCategoryBySlug(slug: string): Promise<DirectoryCategory | null>;
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
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

  const categories: DirectoryCategory[] = [
    { id: "1", name: "Food & Drink", slug: "food-drink", description: "Restaurants, cafes, and bars", businessCount: 1 },
    { id: "2", name: "Home & Garden", slug: "home-garden", description: "Home services and garden centers", businessCount: 1 },
  ];

  return {
    async getBusinesses(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { businesses: businesses.slice(start, start + pageSize), total: businesses.length };
    },
    async getBusinessById(id) {
      return businesses.find((b) => b.id === id) ?? null;
    },
    async getCategories() {
      return categories;
    },
    async getCategoryBySlug(slug) {
      return categories.find((c) => c.slug === slug) ?? null;
    },
  };
}

export function useDatabase(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/directory") {
    return createFakeDatabaseAdapter();
  }
  return createFakeDatabaseAdapter();
}
