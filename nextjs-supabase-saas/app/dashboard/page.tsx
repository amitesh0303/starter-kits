/**
 * Dashboard home page - shows user's tenants (workspaces).
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, SupabaseTenantRepository } from "@/lib/server/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const serviceClient = createServiceClient();
  const tenantRepo = new SupabaseTenantRepository(serviceClient);
  const tenants = await tenantRepo.findByUserId(user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Workspaces</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your teams and projects
          </p>
        </div>
        <Link
          href="/dashboard/tenants/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          New workspace
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-gray-500">No workspaces yet.</p>
          <Link
            href="/dashboard/tenants/new"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Create your first workspace
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Link
              key={tenant.id}
              href={`/dashboard/tenants/${tenant.id}`}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {tenant.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">/{tenant.slug}</p>
              <p className="mt-3 text-xs text-gray-400">
                Created {tenant.createdAt.toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
