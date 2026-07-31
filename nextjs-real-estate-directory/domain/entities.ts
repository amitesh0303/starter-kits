export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  type: "sale" | "rent";
  propertyType: "house" | "apartment" | "condo" | "land";
  bedrooms: number;
  bathrooms: number;
  area: number;
  latitude: number;
  longitude: number;
  images: string[];
  agent: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string | null;
  company: string;
  listingCount: number;
}

export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  propertyCount: number;
}
