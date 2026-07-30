/**
 * Create new project page within a tenant.
 * Server Action validates input, requires auth, checks tenant membership.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  SupabaseMembershipRepository,
  SupabaseProjectRepository,
} from "@/lib/server/database";
import { canAccessProject } from "@/domain/policies";
import { DomainError } from "@/lib/server/errors";

async function createProjectAction(formData: FormData) {
  "use server";

  const tenantId = formData.get("tenantId") as string;
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  // Validate input
  if (!name || name.length < 2) {
    redirect(
      `/dashboard/tenants/${tenantId}/projects/new?error=Name must be at least 2 characters`
    );
  }

  if (name.length > 100) {
    redirect(
      `/dashboard/tenants/${tenantId}/projects/new?error=Name must be at most 100 characters`
    );
  }

  // Require authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const serviceClient = createServiceClient();
  const membershipRepo = new SupabaseMembershipRepository(serviceClient);
  const projectRepo = new SupabaseProjectRepository(serviceClient);

  // Check authorization - must be a member of the tenant
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canAccessProject({ userId: user.id }, memberships)) {
    redirect("/dashboard");
  }

  try {
    await projectRepo.create({
      tenantId,
      name,
      description: description ?? undefined,
    });

    redirect(`/dashboard/tenants/${tenantId}`);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(
        `/dashboard/tenants/${tenantId}/projects/new?error=${encodeURIComponent(error.message)}`
      );
    }
    throw error;
  }
}

export default async function NewProjectPage(props: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { tenantId } = params;
  const error = searchParams.error;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <Link
          href={`/dashboard/tenants/${tenantId}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to workspace
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Create a new project</h1>
      <p className="mt-2 text-sm text-gray-600">
        Projects help you organize your work within a workspace.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={createProjectAction} className="mt-8 space-y-6">
        <input type="hidden" name="tenantId" value={tenantId} />

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="My Project"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="A brief description of the project"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create project
        </button>
      </form>
    </div>
  );
}
