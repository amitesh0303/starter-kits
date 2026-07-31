import type { Property, Agent, PropertyCategory } from "@/domain/entities";

export interface DatabaseAdapter {
  getProperties(page: number, pageSize: number): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: string): Promise<Property | null>;
  getAgents(): Promise<Agent[]>;
  getAgentById(id: string): Promise<Agent | null>;
  getCategories(): Promise<PropertyCategory[]>;
  getPropertiesByType(type: "sale" | "rent", page: number, pageSize: number): Promise<{ properties: Property[]; total: number }>;
}

export function createDatabaseAdapter(): DatabaseAdapter {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL || DATABASE_URL === "postgresql://user:password@localhost:5432/realestate") {
    return createFakeDatabaseAdapter();
  }

  return createFakeDatabaseAdapter();
}

function createFakeDatabaseAdapter(): DatabaseAdapter {
  const properties: Property[] = [
    {
      id: "1",
      title: "Modern Downtown Apartment",
      description: "Beautiful 2-bedroom apartment with city views in the heart of downtown.",
      address: "100 Main St, Apt 5B",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      price: 425000,
      type: "sale",
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      area: 1100,
      latitude: 45.5152,
      longitude: -122.6784,
      images: ["/images/apt-1.jpg"],
      agent: "1",
      featured: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-03-01"),
    },
    {
      id: "2",
      title: "Spacious Family Home with Garden",
      description: "4-bedroom family home with a large garden and modern kitchen.",
      address: "456 Oak Lane",
      city: "Portland",
      state: "OR",
      zipCode: "97205",
      price: 3200,
      type: "rent",
      propertyType: "house",
      bedrooms: 4,
      bathrooms: 3,
      area: 2400,
      latitude: 45.5232,
      longitude: -122.6814,
      images: ["/images/house-1.jpg"],
      agent: "1",
      featured: false,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-15"),
    },
  ];

  const agents: Agent[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0101",
      photo: null,
      company: "Portland Realty",
      listingCount: 2,
    },
  ];

  const categories: PropertyCategory[] = [
    { id: "1", name: "For Sale", slug: "sale", description: "Properties for sale", propertyCount: 1 },
    { id: "2", name: "For Rent", slug: "rent", description: "Properties for rent", propertyCount: 1 },
  ];

  return {
    async getProperties(page, pageSize) {
      const start = (page - 1) * pageSize;
      return { properties: properties.slice(start, start + pageSize), total: properties.length };
    },
    async getPropertyById(id) {
      return properties.find((p) => p.id === id) ?? null;
    },
    async getAgents() {
      return agents;
    },
    async getAgentById(id) {
      return agents.find((a) => a.id === id) ?? null;
    },
    async getCategories() {
      return categories;
    },
    async getPropertiesByType(type, page, pageSize) {
      const filtered = properties.filter((p) => p.type === type);
      const start = (page - 1) * pageSize;
      return { properties: filtered.slice(start, start + pageSize), total: filtered.length };
    },
  };
}
