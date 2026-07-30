-- Create memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_memberships_tenant_id ON public.memberships (tenant_id);
CREATE INDEX idx_memberships_user_id ON public.memberships (user_id);

-- Enable Row Level Security
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Members can view other members in the same tenant
CREATE POLICY "Members can view memberships in their tenants"
  ON public.memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships AS m
      WHERE m.tenant_id = memberships.tenant_id
        AND m.user_id = auth.uid()
    )
  );

-- Owners and admins can add members
CREATE POLICY "Owners and admins can insert memberships"
  ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships AS m
      WHERE m.tenant_id = memberships.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
    OR
    -- Allow the tenant owner to create initial membership (for tenant creation)
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = memberships.tenant_id
        AND tenants.owner_id = auth.uid()
    )
  );

-- Owners and admins can update memberships
CREATE POLICY "Owners and admins can update memberships"
  ON public.memberships
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships AS m
      WHERE m.tenant_id = memberships.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships AS m
      WHERE m.tenant_id = memberships.tenant_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- Owners can delete memberships
CREATE POLICY "Owners can delete memberships"
  ON public.memberships
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships AS m
      WHERE m.tenant_id = memberships.tenant_id
        AND m.user_id = auth.uid()
        AND m.role = 'owner'
    )
  );
