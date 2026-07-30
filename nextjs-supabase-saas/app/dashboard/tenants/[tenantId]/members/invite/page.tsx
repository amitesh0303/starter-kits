/**
 * Invite member page.
 * Server Action validates input, requires auth, checks admin/owner role,
 * creates pending membership and sends invite email.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  SupabaseTenantRepository,
  SupabaseMembershipRepository,
} from "@/lib/server/database";
import { canManageMembers } from "@/domain/policies";
import { DomainError, AuthorizationError } from "@/lib/server/errors";
import { getProviders } from "@/lib/server/providers";

async function inviteMemberAction(formData: FormData) {
  "use server";

  const tenantId = formData.get("tenantId") as string;
  const email = (formData.get("email") as string)?.trim();
  const role = (formData.get("role") as string) || "member";

  // Validate input
  if (!email || !email.includes("@")) {
    redirect(
      `/dashboard/tenants/${tenantId}/members/invite?error=A valid email is required`
    );
  }

  if (!["member", "admin"].includes(role)) {
    redirect(
      `/dashboard/tenants/${tenantId}/members/invite?error=Invalid role selected`
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
  const tenantRepo = new SupabaseTenantRepository(serviceClient);
  const membershipRepo = new SupabaseMembershipRepository(serviceClient);

  // Check authorization - must be owner or admin to invite
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canManageMembers({ userId: user.id }, memberships)) {
    throw new AuthorizationError();
  }

  // Load tenant for email content
  const tenant = await tenantRepo.findById(tenantId);
  if (!tenant) {
    redirect("/dashboard");
  }

  try {
    // For now, create a membership with a placeholder userId (the email).
    // In a real app, you would look up the user by email or create an invite record.
    // The invited user would then accept and their real userId gets set.
    await membershipRepo.create({
      tenantId,
      userId: email, // Placeholder until user accepts invite
      role: role as "member" | "admin",
    });

    // Send invite email via MailPort
    const { mail } = getProviders();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    await mail.sendInviteEmail({
      to: email,
      tenantName: tenant.name,
      inviterName: user.email ?? "A team member",
      inviteUrl: `${appUrl}/auth/signup?invited=true&tenant=${tenantId}`,
    });

    redirect(`/dashboard/tenants/${tenantId}`);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(
        `/dashboard/tenants/${tenantId}/members/invite?error=${encodeURIComponent(error.message)}`
      );
    }
    throw error;
  }
}

export default async function InviteMemberPage(props: {
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

      <h1 className="text-2xl font-bold text-gray-900">Invite a member</h1>
      <p className="mt-2 text-sm text-gray-600">
        Send an invitation to collaborate in this workspace.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form action={inviteMemberAction} className="mt-8 space-y-6">
        <input type="hidden" name="tenantId" value={tenantId} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="teammate@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Admins can invite other members and manage workspace settings.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send invitation
        </button>
      </form>
    </div>
  );
}
