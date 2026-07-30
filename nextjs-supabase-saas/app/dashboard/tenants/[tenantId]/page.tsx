/**
 * Tenant detail page - shows projects, members, and quick actions.
 * Enforces tenant access via membership check.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  SupabaseTenantRepository,
  SupabaseMembershipRepository,
  SupabaseProjectRepository,
} from "@/lib/server/database";
import { canAccessTenant } from "@/domain/policies";

export default async function TenantDetailPage(props: {
  params: Promise<{ tenantId: string }>;
}) {
  const params = await props.params;
  const { tenantId } = params;

  // Require authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const serviceClient = createServiceClient();
  const tenantRepo = new SupabaseTenantRepository(serviceClient);
  const membershipRepo = new SupabaseMembershipRepository(serviceClient);
  const projectRepo = new SupabaseProjectRepository(serviceClient);

  // Load tenant
  const tenant = await tenantRepo.findById(tenantId);
  if (!tenant) {
    redirect("/dashboard");
  }

  // Check authorization
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canAccessTenant({ userId: user.id }, memberships)) {
    redirect("/dashboard");
  }

  // Load projects
  const projects = await projectRepo.findByTenantId(tenantId);

  // Determine user role
  const userMembership = memberships.find((m) => m.userId === user.id);
  const isAdmin = userMembership?.role === "owner" || userMembership?.role === "admin";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="mt-1 text-sm text-gray-500">/{tenant.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/tenants/${tenantId}/billing`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Billing
          </Link>
          {isAdmin && (
            <Link
              href={`/dashboard/tenants/${tenantId}/members/invite`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Invite member
            </Link>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <Link
            href={`/dashboard/tenants/${tenantId}/projects/new`}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            New project
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No projects yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                {project.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {project.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  Created {project.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members Section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">Members</h2>
        <div className="mt-4 space-y-2">
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {membership.userId === user.id ? "You" : membership.userId}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {membership.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
