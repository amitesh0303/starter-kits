import { Article, Category } from "../domain/entities";
export interface CMSAdapter { getArticles(category?: string): Promise<Article[]>; getCategories(): Promise<Category[]>; getArticleBySlug(slug: string): Promise<Article | null>; }
export function createFakeCMSAdapter(): CMSAdapter {
  const articles: Article[] = [{ id: "a1", title: "Getting Started", slug: "getting-started", excerpt: "Learn the basics", body: "Full article content here.", category: "tutorial", author: "Editor", imageUrl: null, publishedAt: "2024-06-01T00:00:00Z", readTimeMinutes: 5 }];
  return {
    async getArticles(_cat) { return articles; },
    async getCategories() { return [{ id: "c1", name: "Tutorials", slug: "tutorial", articleCount: 1 }]; },
    async getArticleBySlug(slug) { return articles.find(a => a.slug === slug) || null; },
  };
}
