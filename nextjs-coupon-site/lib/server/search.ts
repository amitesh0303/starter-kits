import type { Coupon } from "@/domain/entities";

export interface SearchAdapter {
  search(query: string): Promise<{ coupons: Coupon[]; total: number }>;
}

export function createSearchAdapter(): SearchAdapter {
  const MEILISEARCH_URL = process.env.MEILISEARCH_URL;

  if (!MEILISEARCH_URL || MEILISEARCH_URL === "http://localhost:7700") {
    return createFakeSearchAdapter();
  }

  return createFakeSearchAdapter();
}

function createFakeSearchAdapter(): SearchAdapter {
  const coupons: Coupon[] = [
    {
      id: "1",
      code: "SAVE20",
      title: "20% Off All Electronics",
      description: "Get 20% off all electronics and gadgets.",
      store: "techstore",
      category: "electronics",
      discount: "20%",
      affiliateUrl: "https://example.com/techstore?ref=coupon",
      expiresAt: new Date("2025-12-31"),
      verified: true,
      clicks: 245,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-03-01"),
    },
  ];

  return {
    async search(query) {
      const q = query.toLowerCase();
      const filtered = coupons.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.store.toLowerCase().includes(q)
      );
      return { coupons: filtered, total: filtered.length };
    },
  };
}
