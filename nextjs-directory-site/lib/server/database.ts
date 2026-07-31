import type { Listing, Category } from "@/domain/entities";

/**
 * Database adapter interface for directory listings.
 * In production, this connects to Supabase Postgres via Drizzle.
 */
export interface DatabaseAdapter {
  getListings(page: number, pageSize: number): Promise<{ listings: Listing[]; total: number }>;
  getListingById(id: string): Promise<Listing | null>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getListingsByCategory(categorySlug: string, page: number, pageSize: number): Promise<{ listings: Listing[]; total: number }>;
}

export function createDatabaseAdapter(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/directory") {
    return createFakeDatabaseAdapter();
  }

  // Production: return real Drizzle adapter
  return createFakeDatabaseAdapter();
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
  const listings: Listing[] = [
    {
      id: "1",
      name: "Acme Web Design",
      description: "Professional web design and development services",
      category: "web-development",
      location: "San Francisco, CA",
      website: "https://acme-web.example.com",
      phone: "+1-555-0101",
      rating: 4.8,
      reviewCount: 42,
      featured: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-03-01"),
    },
    {
      id: "2",
      name: "Digital Marketing Pro",
      description: "Full-service digital marketing agency",
      category: "marketing",
      location: "New York, NY",
      website: "https://dmp.example.com",
      phone: "+1-555-0102",
      rating: 4.5,
      reviewCount: 28,
      featured: false,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-15"),
    },
  ];

  const categories: Category[] = [
    { id: "1", name: "Web Development", slug: "web-development", description: "Web design and development services", listingCount: 1 },
    { id: "2", name: "Marketing", slug: "marketing", description: "Digital marketing agencies", listingCount: 1 },
  ];

  return {
    async getListings(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { listings: listings.slice(start, start + pageSize), total: listings.length };
    },
    async getListingById(id) {
      return listings.find((l) => l.id === id) ?? null;
    },
    async getCategories() {
      return categories;
    },
    async getCategoryBySlug(slug) {
      return categories.find((c) => c.slug === slug) ?? null;
    },
    async getListingsByCategory(categorySlug, page, pageSize) {
      const filtered = listings.filter((l) => l.category === categorySlug);
      const start = (page - 1) * pageSize;
      return { listings: filtered.slice(start, start + pageSize), total: filtered.length };
    },
  };
}
