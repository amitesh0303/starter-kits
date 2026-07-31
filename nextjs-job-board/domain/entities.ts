export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  salary: string | null;
  description: string;
  category: string;
  featured: boolean;
  publishedAt: Date;
  expiresAt: Date;
  status: "draft" | "active" | "expired";
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  jobCount: number;
}

export interface Employer {
  id: string;
  name: string;
  email: string;
  company: string;
  logo: string | null;
  planType: "free" | "standard" | "premium";
}

export interface PricingPlan {
  id: string;
  name: string;
  priceInCents: number;
  durationDays: number;
  featured: boolean;
}
