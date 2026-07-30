/**
 * Create new tenant page.
 * Server Action validates input, requires authentication, creates tenant + owner membership.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  SupabaseTenantRepository,
  SupabaseMembershipRepository,
} from "@/lib/server/database";
import { ValidationError, DomainError } from "@/lib/server/errors";

async function createTenantAction(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string)?.trim();

  // Validate input
  if (!name || name.length < 2) {
    redirect("/dashboard/tenants/new?error=Name must be at least 2 characters");
  }

  if (name.length > 100) {
    redirect("/dashboard/tenants/new?error=Name must be at most 100 characters");
  }

  // Require authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const serviceClient = createServiceClient();
  const tenantRepo = new SupabaseTenantRepository(serviceClient);
  const membershipRepo = new SupabaseMembershipRepository(serviceClient);

  try {
    // Check for slug uniqueness
    const existing = await tenantRepo.findBySlug(slug);
    if (existing) {
      throw new ValidationError("A workspace with this name already exists");
    }

    // Create tenant with current user as owner
    const tenant = await tenantRepo.create({
      name,
      slug,
      ownerId: user.id,
    });

    // Create owner membership (commit point - both must succeed)
    await membershipRepo.create({
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
    });

    redirect(`/dashboard/tenants/${tenant.id}`);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(`/dashboard/tenants/new?error=${encodeURIComponent(error.message)}`);
    }
    // Re-throw redirect errors (Next.js uses error-based redirects)
    throw error;
  }
}

export default async function NewTenantPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const error = searchParams.error;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">
        Create a new workspace
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        A workspace is a shared space for your team to collaborate on projects.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={createTenantAction} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Workspace name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="My Awesome Team"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will also generate a URL-friendly slug.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create workspace
        </button>
      </form>
    </div>
  );
}
