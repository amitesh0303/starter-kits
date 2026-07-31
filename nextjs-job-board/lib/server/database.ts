import type { Job, JobCategory } from "@/domain/entities";

export interface DatabaseAdapter {
  getJobs(page: number, pageSize: number): Promise<{ jobs: Job[]; total: number }>;
  getJobById(id: string): Promise<Job | null>;
  getCategories(): Promise<JobCategory[]>;
  getCategoryBySlug(slug: string): Promise<JobCategory | null>;
  getJobsByCategory(categorySlug: string, page: number, pageSize: number): Promise<{ jobs: Job[]; total: number }>;
}

export function createDatabaseAdapter(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/jobboard") {
    return createFakeDatabaseAdapter();
  }

  return createFakeDatabaseAdapter();
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
  const jobs: Job[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      type: "full-time",
      salary: "$120,000 - $160,000",
      description: "We are looking for an experienced frontend developer to join our team.",
      category: "engineering",
      featured: true,
      publishedAt: new Date("2024-03-01"),
      expiresAt: new Date("2024-04-01"),
      status: "active",
    },
    {
      id: "2",
      title: "Product Designer",
      company: "DesignStudio",
      location: "New York, NY",
      type: "full-time",
      salary: "$90,000 - $130,000",
      description: "Join our design team to create beautiful user experiences.",
      category: "design",
      featured: false,
      publishedAt: new Date("2024-03-05"),
      expiresAt: new Date("2024-04-05"),
      status: "active",
    },
  ];

  const categories: JobCategory[] = [
    { id: "1", name: "Engineering", slug: "engineering", description: "Software engineering roles", jobCount: 1 },
    { id: "2", name: "Design", slug: "design", description: "Design and UX roles", jobCount: 1 },
  ];

  return {
    async getJobs(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { jobs: jobs.slice(start, start + pageSize), total: jobs.length };
    },
    async getJobById(id) {
      return jobs.find((j) => j.id === id) ?? null;
    },
    async getCategories() {
      return categories;
    },
    async getCategoryBySlug(slug) {
      return categories.find((c) => c.slug === slug) ?? null;
    },
    async getJobsByCategory(categorySlug, page, pageSize) {
      const filtered = jobs.filter((j) => j.category === categorySlug);
      const start = (page - 1) * pageSize;
      return { jobs: filtered.slice(start, start + pageSize), total: filtered.length };
    },
  };
}
