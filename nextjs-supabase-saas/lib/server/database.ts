/**
 * Repository interfaces and Supabase Postgres adapter with RLS-enforced queries.
 * Sanitized error mapping - no stack traces or secret leakage.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Tenant,
  Membership,
  MembershipRole,
  Project,
  Subscription,
  SubscriptionStatus,
  ProcessedEvent,
} from "@/domain/entities";
import {
  NotFoundError,
  ConflictError,
  sanitizeProviderError,
  DomainError,
} from "./errors";

// ─── Repository Interfaces ─────────────────────────────────────────────────────

export interface TenantRepository {
  create(params: {
    name: string;
    slug: string;
    ownerId: string;
  }): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findByUserId(userId: string): Promise<Tenant[]>;
  update(id: string, params: Partial<Pick<Tenant, "name" | "slug">>): Promise<Tenant>;
  delete(id: string): Promise<void>;
}

export interface MembershipRepository {
  create(params: {
    tenantId: string;
    userId: string;
    role: MembershipRole;
  }): Promise<Membership>;
  findByTenantId(tenantId: string): Promise<Membership[]>;
  findByUserId(userId: string): Promise<Membership[]>;
  findByTenantAndUser(tenantId: string, userId: string): Promise<Membership | null>;
  update(id: string, params: { role: MembershipRole }): Promise<Membership>;
  delete(id: string): Promise<void>;
}

export interface ProjectRepository {
  create(params: {
    tenantId: string;
    name: string;
    description?: string;
  }): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByTenantId(tenantId: string): Promise<Project[]>;
  update(
    id: string,
    params: Partial<Pick<Project, "name" | "description">>
  ): Promise<Project>;
  delete(id: string): Promise<void>;
}

export interface SubscriptionRepository {
  upsertByStripeSubscriptionId(params: {
    tenantId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<Subscription>;
  findByTenantId(tenantId: string): Promise<Subscription | null>;
  findByStripeCustomerId(customerId: string): Promise<Subscription | null>;
  findByStripeSubscriptionId(subscriptionId: string): Promise<Subscription | null>;
  updateStatus(
    stripeSubscriptionId: string,
    params: {
      status: SubscriptionStatus;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<Subscription>;
}

export interface ProcessedEventRepository {
  exists(providerEventId: string): Promise<boolean>;
  create(params: {
    providerEventId: string;
    eventType: string;
  }): Promise<ProcessedEvent>;
}

// ─── Row-to-Entity Mappers ──────────────────────────────────────────────────────

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface MembershipRow {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface ProjectRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionRow {
  id: string;
  tenant_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface ProcessedEventRow {
  id: string;
  provider_event_id: string;
  event_type: string;
  processed_at: string;
}

function toTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toMembership(row: MembershipRow): Membership {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    role: row.role as MembershipRole,
    createdAt: new Date(row.created_at),
  };
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: new Date(row.current_period_end),
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function toProcessedEvent(row: ProcessedEventRow): ProcessedEvent {
  return {
    id: row.id,
    providerEventId: row.provider_event_id,
    eventType: row.event_type,
    processedAt: new Date(row.processed_at),
  };
}

// ─── Supabase Client Factory ────────────────────────────────────────────────────

/**
 * Creates a Supabase admin client (service role) for server-side operations.
 * Uses service role key to bypass RLS where needed (webhook processing, etc.)
 */
export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new DomainError(
      "Database configuration is missing",
      "CONFIG_ERROR",
      500
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Creates a Supabase client scoped to a user's JWT for RLS enforcement.
 */
export function createUserClient(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new DomainError(
      "Database configuration is missing",
      "CONFIG_ERROR",
      500
    );
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Repository Implementations ─────────────────────────────────────────────────

function handleSupabaseError(error: { code?: string; message?: string }): never {
  if (error.code === "23505") {
    throw new ConflictError("Resource already exists");
  }
  throw new DomainError("Database operation failed", "DB_ERROR", 500);
}

export class SupabaseTenantRepository implements TenantRepository {
  constructor(private client: SupabaseClient) {}

  async create(params: {
    name: string;
    slug: string;
    ownerId: string;
  }): Promise<Tenant> {
    try {
      const { data, error } = await this.client
        .from("tenants")
        .insert({
          name: params.name,
          slug: params.slug,
          owner_id: params.ownerId,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return toTenant(data as TenantRow);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to create tenant");
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.client
        .from("tenants")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toTenant(data as TenantRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find tenant");
    }
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    try {
      const { data, error } = await this.client
        .from("tenants")
        .select()
        .eq("slug", slug)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toTenant(data as TenantRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find tenant");
    }
  }

  async findByUserId(userId: string): Promise<Tenant[]> {
    try {
      const { data: memberships, error: mError } = await this.client
        .from("memberships")
        .select("tenant_id")
        .eq("user_id", userId);

      if (mError) handleSupabaseError(mError);
      if (!memberships || memberships.length === 0) return [];

      const tenantIds = memberships.map((m: { tenant_id: string }) => m.tenant_id);
      const { data, error } = await this.client
        .from("tenants")
        .select()
        .in("id", tenantIds);

      if (error) handleSupabaseError(error);
      return (data as TenantRow[]).map(toTenant);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find tenants");
    }
  }

  async update(
    id: string,
    params: Partial<Pick<Tenant, "name" | "slug">>
  ): Promise<Tenant> {
    try {
      const { data, error } = await this.client
        .from("tenants")
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      if (!data) throw new NotFoundError("Tenant");
      return toTenant(data as TenantRow);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to update tenant");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from("tenants")
        .delete()
        .eq("id", id);

      if (error) handleSupabaseError(error);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to delete tenant");
    }
  }
}

export class SupabaseMembershipRepository implements MembershipRepository {
  constructor(private client: SupabaseClient) {}

  async create(params: {
    tenantId: string;
    userId: string;
    role: MembershipRole;
  }): Promise<Membership> {
    try {
      const { data, error } = await this.client
        .from("memberships")
        .insert({
          tenant_id: params.tenantId,
          user_id: params.userId,
          role: params.role,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return toMembership(data as MembershipRow);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to create membership");
    }
  }

  async findByTenantId(tenantId: string): Promise<Membership[]> {
    try {
      const { data, error } = await this.client
        .from("memberships")
        .select()
        .eq("tenant_id", tenantId);

      if (error) handleSupabaseError(error);
      return (data as MembershipRow[]).map(toMembership);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find memberships");
    }
  }

  async findByUserId(userId: string): Promise<Membership[]> {
    try {
      const { data, error } = await this.client
        .from("memberships")
        .select()
        .eq("user_id", userId);

      if (error) handleSupabaseError(error);
      return (data as MembershipRow[]).map(toMembership);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find memberships");
    }
  }

  async findByTenantAndUser(
    tenantId: string,
    userId: string
  ): Promise<Membership | null> {
    try {
      const { data, error } = await this.client
        .from("memberships")
        .select()
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toMembership(data as MembershipRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find membership");
    }
  }

  async update(id: string, params: { role: MembershipRole }): Promise<Membership> {
    try {
      const { data, error } = await this.client
        .from("memberships")
        .update({ role: params.role })
        .eq("id", id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      if (!data) throw new NotFoundError("Membership");
      return toMembership(data as MembershipRow);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to update membership");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from("memberships")
        .delete()
        .eq("id", id);

      if (error) handleSupabaseError(error);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to delete membership");
    }
  }
}

export class SupabaseProjectRepository implements ProjectRepository {
  constructor(private client: SupabaseClient) {}

  async create(params: {
    tenantId: string;
    name: string;
    description?: string;
  }): Promise<Project> {
    try {
      const { data, error } = await this.client
        .from("projects")
        .insert({
          tenant_id: params.tenantId,
          name: params.name,
          description: params.description ?? null,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return toProject(data as ProjectRow);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to create project");
    }
  }

  async findById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await this.client
        .from("projects")
        .select()
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toProject(data as ProjectRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find project");
    }
  }

  async findByTenantId(tenantId: string): Promise<Project[]> {
    try {
      const { data, error } = await this.client
        .from("projects")
        .select()
        .eq("tenant_id", tenantId);

      if (error) handleSupabaseError(error);
      return (data as ProjectRow[]).map(toProject);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find projects");
    }
  }

  async update(
    id: string,
    params: Partial<Pick<Project, "name" | "description">>
  ): Promise<Project> {
    try {
      const { data, error } = await this.client
        .from("projects")
        .update({ ...params, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      if (!data) throw new NotFoundError("Project");
      return toProject(data as ProjectRow);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to update project");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) handleSupabaseError(error);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to delete project");
    }
  }
}

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  constructor(private client: SupabaseClient) {}

  async upsertByStripeSubscriptionId(params: {
    tenantId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }): Promise<Subscription> {
    try {
      const { data, error } = await this.client
        .from("subscriptions")
        .upsert(
          {
            tenant_id: params.tenantId,
            stripe_customer_id: params.stripeCustomerId,
            stripe_subscription_id: params.stripeSubscriptionId,
            stripe_price_id: params.stripePriceId,
            status: params.status,
            current_period_end: params.currentPeriodEnd.toISOString(),
            cancel_at_period_end: params.cancelAtPeriodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        )
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return toSubscription(data as SubscriptionRow);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to upsert subscription");
    }
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.client
        .from("subscriptions")
        .select()
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toSubscription(data as SubscriptionRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find subscription");
    }
  }

  async findByStripeCustomerId(customerId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.client
        .from("subscriptions")
        .select()
        .eq("stripe_customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toSubscription(data as SubscriptionRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find subscription");
    }
  }

  async findByStripeSubscriptionId(
    subscriptionId: string
  ): Promise<Subscription | null> {
    try {
      const { data, error } = await this.client
        .from("subscriptions")
        .select()
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        handleSupabaseError(error);
      }
      return data ? toSubscription(data as SubscriptionRow) : null;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to find subscription");
    }
  }

  async updateStatus(
    stripeSubscriptionId: string,
    params: {
      status: SubscriptionStatus;
      currentPeriodEnd?: Date;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<Subscription> {
    try {
      const updateData: Record<string, unknown> = {
        status: params.status,
        updated_at: new Date().toISOString(),
      };
      if (params.currentPeriodEnd) {
        updateData.current_period_end = params.currentPeriodEnd.toISOString();
      }
      if (params.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = params.cancelAtPeriodEnd;
      }

      const { data, error } = await this.client
        .from("subscriptions")
        .update(updateData)
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      if (!data) throw new NotFoundError("Subscription");
      return toSubscription(data as SubscriptionRow);
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to update subscription");
    }
  }
}

export class SupabaseProcessedEventRepository
  implements ProcessedEventRepository
{
  constructor(private client: SupabaseClient) {}

  async exists(providerEventId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from("processed_events")
        .select("id")
        .eq("provider_event_id", providerEventId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return false;
        handleSupabaseError(error);
      }
      return !!data;
    } catch (error) {
      if (error instanceof DomainError) throw error;
      throw sanitizeProviderError(error, "Failed to check processed event");
    }
  }

  async create(params: {
    providerEventId: string;
    eventType: string;
  }): Promise<ProcessedEvent> {
    try {
      const { data, error } = await this.client
        .from("processed_events")
        .insert({
          provider_event_id: params.providerEventId,
          event_type: params.eventType,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return toProcessedEvent(data as ProcessedEventRow);
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to record processed event");
    }
  }
}
