export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  rating: number;
  reviewCount: number;
  sponsored: boolean;
}

export interface DirectoryCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessCount: number;
}

export interface SearchQuery {
  query: string;
  category?: string;
  city?: string;
  page?: number;
  pageSize?: number;
}
