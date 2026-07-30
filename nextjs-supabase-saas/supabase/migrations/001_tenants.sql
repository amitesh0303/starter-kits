-- Create tenants table
-- NOTE: updated_at is application-managed (set in TypeScript repository layer on each update).
-- This avoids a Postgres trigger dependency, improving portability across hosting providers.
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_slug ON public.tenants (slug);
CREATE INDEX idx_tenants_owner_id ON public.tenants (owner_id);

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- NOTE: The tenant SELECT policy (membership-based) is created in 002_memberships.sql
-- because it references public.memberships which does not exist until that migration runs.
-- This avoids a forward-reference that would fail if migrations are applied individually.

-- Only the owner can update the tenant
CREATE POLICY "Owners can update their tenants"
  ON public.tenants
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Authenticated users can create tenants (they become owner)
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Only owners can delete tenants
CREATE POLICY "Owners can delete their tenants"
  ON public.tenants
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());
