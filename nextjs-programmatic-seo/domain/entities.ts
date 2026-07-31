export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  template: string;
  keywords: string[];
  location?: string;
  category?: string;
  publishedAt: Date;
  updatedAt: Date;
  status: "draft" | "published" | "archived";
}

export interface PageTemplate {
  id: string;
  name: string;
  slug: string;
  pattern: string;
  variableKeys: string[];
}

export interface GenerationJob {
  id: string;
  templateId: string;
  status: "pending" | "running" | "completed" | "failed";
  pagesGenerated: number;
  createdAt: Date;
  completedAt?: Date;
}
