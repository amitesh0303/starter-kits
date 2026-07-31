/**
 * Database repository layer using Drizzle ORM.
 * Provides typed access to organizations, memberships, customers, and subscriptions.
 * In test/development, use in-memory fakes via providers.ts.
 */

import type {
  Organization,
  Membership,
  Customer,
  Subscription,
  ProcessedEvent,
  Role,
  MembershipStatus,
  SubscriptionStatus,
} from "@/domain/entities";

// --- Repository Interfaces ---

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  create(org: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization>;
  update(id: string, data: Partial<Pick<Organization, "name" | "slug">>): Promise<Organization | null>;
  delete(id: string): Promise<void>;
}

export interface MembershipRepository {
  findByOrgAndUser(organizationId: string, userId: string): Promise<Membership | null>;
  findByOrganization(organizationId: string): Promise<Membership[]>;
  findByUser(userId: string): Promise<Membership[]>;
  create(membership: Omit<Membership, "id" | "createdAt" | "updatedAt">): Promise<Membership>;
  updateRole(id: string, role: Role): Promise<Membership | null>;
  updateStatus(id: string, status: MembershipStatus): Promise<Membership | null>;
  delete(id: string): Promise<void>;
}

export interface CustomerRepository {
  findByOrganization(organizationId: string): Promise<Customer | null>;
  create(customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer>;
}

export interface SubscriptionRepository {
  findByOrganization(organizationId: string): Promise<Subscription | null>;
  create(sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription>;
  updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription | null>;
}

export interface EventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(event: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent>;
}

// --- In-Memory Fake Repository (for testing) ---

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private orgs: Map<string, Organization> = new Map();

  async findById(id: string): Promise<Organization | null> {
    return this.orgs.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    for (const org of this.orgs.values()) {
      if (org.slug === slug) return org;
    }
    return null;
  }

  async create(data: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const org: Organization = {
      ...data,
      id: `org_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orgs.set(org.id, org);
    return org;
  }

  async update(id: string, data: Partial<Pick<Organization, "name" | "slug">>): Promise<Organization | null> {
    const org = this.orgs.get(id);
    if (!org) return null;
    const updated = { ...org, ...data, updatedAt: new Date() };
    this.orgs.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.orgs.delete(id);
  }
}

export class InMemoryMembershipRepository implements MembershipRepository {
  private memberships: Map<string, Membership> = new Map();

  async findByOrgAndUser(organizationId: string, userId: string): Promise<Membership | null> {
    for (const m of this.memberships.values()) {
      if (m.organizationId === organizationId && m.userId === userId) return m;
    }
    return null;
  }

  async findByOrganization(organizationId: string): Promise<Membership[]> {
    return Array.from(this.memberships.values()).filter(
      (m) => m.organizationId === organizationId
    );
  }

  async findByUser(userId: string): Promise<Membership[]> {
    return Array.from(this.memberships.values()).filter(
      (m) => m.userId === userId
    );
  }

  async create(data: Omit<Membership, "id" | "createdAt" | "updatedAt">): Promise<Membership> {
    const membership: Membership = {
      ...data,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memberships.set(membership.id, membership);
    return membership;
  }

  async updateRole(id: string, role: Role): Promise<Membership | null> {
    const m = this.memberships.get(id);
    if (!m) return null;
    const updated = { ...m, role, updatedAt: new Date() };
    this.memberships.set(id, updated);
    return updated;
  }

  async updateStatus(id: string, status: MembershipStatus): Promise<Membership | null> {
    const m = this.memberships.get(id);
    if (!m) return null;
    const updated = { ...m, status, updatedAt: new Date() };
    this.memberships.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.memberships.delete(id);
  }
}

export class InMemoryCustomerRepository implements CustomerRepository {
  private customers: Map<string, Customer> = new Map();

  async findByOrganization(organizationId: string): Promise<Customer | null> {
    for (const c of this.customers.values()) {
      if (c.organizationId === organizationId) return c;
    }
    return null;
  }

  async create(data: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const customer: Customer = {
      ...data,
      id: `cus_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }
}

export class InMemorySubscriptionRepository implements SubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();

  async findByOrganization(organizationId: string): Promise<Subscription | null> {
    for (const s of this.subscriptions.values()) {
      if (s.organizationId === organizationId) return s;
    }
    return null;
  }

  async create(data: Omit<Subscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription> {
    const sub: Subscription = {
      ...data,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription | null> {
    const s = this.subscriptions.get(id);
    if (!s) return null;
    const updated = { ...s, status, updatedAt: new Date() };
    this.subscriptions.set(id, updated);
    return updated;
  }
}

export class InMemoryEventRepository implements EventRepository {
  private events: Map<string, ProcessedEvent> = new Map();

  async exists(providerEventId: string): Promise<boolean> {
    for (const e of this.events.values()) {
      if (e.providerEventId === providerEventId) return true;
    }
    return false;
  }

  async create(data: Omit<ProcessedEvent, "id" | "processedAt">): Promise<ProcessedEvent> {
    const event: ProcessedEvent = {
      ...data,
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      processedAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }
}
