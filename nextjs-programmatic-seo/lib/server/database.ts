import type { LandingPage, PageTemplate } from "@/domain/entities";

export interface DatabaseAdapter {
  getPages(page: number, pageSize: number): Promise<{ pages: LandingPage[]; total: number }>;
  getPageBySlug(slug: string): Promise<LandingPage | null>;
  getTemplates(): Promise<PageTemplate[]>;
  getTemplateById(id: string): Promise<PageTemplate | null>;
}

export function createDatabaseAdapter(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/seo") {
    return createFakeDatabaseAdapter();
  }

  return createFakeDatabaseAdapter();
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
  const pages: LandingPage[] = [
    {
      id: "1",
      slug: "best-web-development-san-francisco",
      title: "Best Web Development in San Francisco",
      description: "Find top-rated web development services in San Francisco, CA.",
      content: "Looking for professional web developers in San Francisco?",
      template: "city-service",
      keywords: ["web development", "san francisco"],
      location: "San Francisco, CA",
      category: "web-development",
      publishedAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-03-01"),
      status: "published",
    },
    {
      id: "2",
      slug: "best-digital-marketing-new-york",
      title: "Best Digital Marketing in New York",
      description: "Find top-rated digital marketing services in New York, NY.",
      content: "Looking for professional digital marketers in New York?",
      template: "city-service",
      keywords: ["digital marketing", "new york"],
      location: "New York, NY",
      category: "marketing",
      publishedAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-15"),
      status: "published",
    },
  ];

  const templates: PageTemplate[] = [
    {
      id: "1",
      name: "City + Service",
      slug: "city-service",
      pattern: "best-{service}-{city}",
      variableKeys: ["service", "city"],
    },
  ];

  return {
    async getPages(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { pages: pages.slice(start, start + pageSize), total: pages.length };
    },
    async getPageBySlug(slug) {
      return pages.find((p) => p.slug === slug) ?? null;
    },
    async getTemplates() {
      return templates;
    },
    async getTemplateById(id) {
      return templates.find((t) => t.id === id) ?? null;
    },
  };
}
