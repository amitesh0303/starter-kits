/**
 * Billing page - shows subscription status and allows subscribing via Stripe Checkout.
 * Server Actions handle checkout session creation and billing portal access.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createServiceClient,
  SupabaseMembershipRepository,
  SupabaseSubscriptionRepository,
} from "@/lib/server/database";
import { canAccessTenant } from "@/domain/policies";
import { getProviders } from "@/lib/server/providers";
import { DomainError } from "@/lib/server/errors";

async function createCheckoutAction(formData: FormData) {
  "use server";

  const tenantId = formData.get("tenantId") as string;

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

  // Check authorization
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canAccessTenant({ userId: user.id }, memberships)) {
    redirect("/dashboard");
  }

  const { billing } = getProviders();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const priceId = process.env.STRIPE_PRICE_ID || "price_placeholder";

  try {
    const checkoutUrl = await billing.createCheckoutSession({
      tenantId,
      customerEmail: user.email ?? undefined,
      priceId,
      successUrl: `${appUrl}/dashboard/tenants/${tenantId}/billing?success=true`,
      cancelUrl: `${appUrl}/dashboard/tenants/${tenantId}/billing?cancelled=true`,
    });

    redirect(checkoutUrl);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(
        `/dashboard/tenants/${tenantId}/billing?error=${encodeURIComponent(error.message)}`
      );
    }
    throw error;
  }
}

async function manageBillingAction(formData: FormData) {
  "use server";

  const tenantId = formData.get("tenantId") as string;
  const customerId = formData.get("customerId") as string;

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

  // Check authorization
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canAccessTenant({ userId: user.id }, memberships)) {
    redirect("/dashboard");
  }

  const { billing } = getProviders();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const portalUrl = await billing.createBillingPortalSession({
      customerId,
      returnUrl: `${appUrl}/dashboard/tenants/${tenantId}/billing`,
    });

    redirect(portalUrl);
  } catch (error) {
    if (error instanceof DomainError) {
      redirect(
        `/dashboard/tenants/${tenantId}/billing?error=${encodeURIComponent(error.message)}`
      );
    }
    throw error;
  }
}

export default async function BillingPage(props: {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ error?: string; success?: string; cancelled?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { tenantId } = params;
  const error = searchParams.error;
  const success = searchParams.success;
  const cancelled = searchParams.cancelled;

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
  const subscriptionRepo = new SupabaseSubscriptionRepository(serviceClient);

  // Check authorization
  const memberships = await membershipRepo.findByTenantId(tenantId);
  if (!canAccessTenant({ userId: user.id }, memberships)) {
    redirect("/dashboard");
  }

  // Load subscription status
  const subscription = await subscriptionRepo.findByTenantId(tenantId);

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

      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="mt-2 text-sm text-gray-600">
        Manage your subscription and billing details.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">
            Subscription activated successfully!
          </p>
        </div>
      )}

      {cancelled && (
        <div className="mt-4 rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-700">
            Checkout was cancelled. You can try again anytime.
          </p>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        {subscription ? (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Plan
              </h3>
              <StatusBadge status={subscription.status} />
            </div>

            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {subscription.status}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Current period ends</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {subscription.currentPeriodEnd.toLocaleDateString()}
                </dd>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="rounded-md bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-700">
                    Your subscription will be cancelled at the end of the current
                    billing period.
                  </p>
                </div>
              )}
            </dl>

            <form action={manageBillingAction} className="mt-6">
              <input type="hidden" name="tenantId" value={tenantId} />
              <input
                type="hidden"
                name="customerId"
                value={subscription.stripeCustomerId}
              />
              <button
                type="submit"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Manage billing
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              No active subscription
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Subscribe to unlock all features for your workspace.
            </p>

            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h4 className="font-medium text-blue-900">Pro Plan</h4>
              <p className="mt-1 text-sm text-blue-700">$29/month</p>
              <ul className="mt-3 space-y-1 text-sm text-blue-700">
                <li>Unlimited projects</li>
                <li>Up to 10 team members</li>
                <li>Priority support</li>
              </ul>
            </div>

            <form action={createCheckoutAction} className="mt-6">
              <input type="hidden" name="tenantId" value={tenantId} />
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Subscribe now
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    trialing: "bg-blue-50 text-blue-700",
    past_due: "bg-red-50 text-red-700",
    cancelled: "bg-gray-50 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || colors.active}`}
    >
      {status}
    </span>
  );
}
