import type { Coupon, Store, CouponCategory } from "@/domain/entities";

export interface DatabaseAdapter {
  getCoupons(page: number, pageSize: number): Promise<{ coupons: Coupon[]; total: number }>;
  getCouponById(id: string): Promise<Coupon | null>;
  getStores(): Promise<Store[]>;
  getStoreBySlug(slug: string): Promise<Store | null>;
  getCategories(): Promise<CouponCategory[]>;
  getCouponsByStore(storeSlug: string, page: number, pageSize: number): Promise<{ coupons: Coupon[]; total: number }>;
}

export function createDatabaseAdapter(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/coupons") {
    return createFakeDatabaseAdapter();
  }

  return createFakeDatabaseAdapter();
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
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
    {
      id: "2",
      code: "FREESHIP",
      title: "Free Shipping on Orders Over $50",
      description: "Free standard shipping on orders $50 or more.",
      store: "fashionhub",
      category: "fashion",
      discount: "Free Shipping",
      affiliateUrl: "https://example.com/fashionhub?ref=coupon",
      expiresAt: null,
      verified: true,
      clicks: 120,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-15"),
    },
  ];

  const stores: Store[] = [
    { id: "1", name: "TechStore", slug: "techstore", logo: null, website: "https://techstore.example.com", couponCount: 1 },
    { id: "2", name: "FashionHub", slug: "fashionhub", logo: null, website: "https://fashionhub.example.com", couponCount: 1 },
  ];

  const categories: CouponCategory[] = [
    { id: "1", name: "Electronics", slug: "electronics", description: "Electronics and gadgets deals", couponCount: 1 },
    { id: "2", name: "Fashion", slug: "fashion", description: "Clothing and fashion deals", couponCount: 1 },
  ];

  return {
    async getCoupons(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { coupons: coupons.slice(start, start + pageSize), total: coupons.length };
    },
    async getCouponById(id) {
      return coupons.find((c) => c.id === id) ?? null;
    },
    async getStores() {
      return stores;
    },
    async getStoreBySlug(slug) {
      return stores.find((s) => s.slug === slug) ?? null;
    },
    async getCategories() {
      return categories;
    },
    async getCouponsByStore(storeSlug, page, pageSize) {
      const filtered = coupons.filter((c) => c.store === storeSlug);
      const start = (page - 1) * pageSize;
      return { coupons: filtered.slice(start, start + pageSize), total: filtered.length };
    },
  };
}
