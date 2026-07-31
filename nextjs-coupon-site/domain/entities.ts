export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  store: string;
  category: string;
  discount: string;
  affiliateUrl: string;
  expiresAt: Date | null;
  verified: boolean;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  website: string;
  couponCount: number;
}

export interface CouponCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  couponCount: number;
}
