export interface Listing {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  website: string | null;
  phone: string | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  listingCount: number;
}

export interface SearchResult {
  listings: Listing[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchQuery {
  query: string;
  category?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}
